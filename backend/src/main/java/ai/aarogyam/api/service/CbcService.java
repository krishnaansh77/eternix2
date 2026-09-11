package ai.aarogyam.api.service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import ai.aarogyam.api.domain.CbcPrediction;
import ai.aarogyam.api.domain.CbcReport;
import ai.aarogyam.api.domain.PatientProfile;
import ai.aarogyam.api.domain.Role;
import ai.aarogyam.api.domain.User;
import ai.aarogyam.api.dto.CbcPredictRequest;
import ai.aarogyam.api.dto.CbcPredictionResponse;
import ai.aarogyam.api.repository.CbcPredictionRepository;
import ai.aarogyam.api.repository.CbcReportRepository;
import ai.aarogyam.api.repository.PatientProfileRepository;
import ai.aarogyam.api.repository.UserRepository;
import ai.aarogyam.api.security.AuthPrincipal;

@Service
public class CbcService {

    private final CbcReportRepository reportRepository;
    private final CbcPredictionRepository predictionRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final DoctorPatientService relationshipService;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;
    private final String cbcBaseUrl;

    public CbcService(
            CbcReportRepository reportRepository,
            CbcPredictionRepository predictionRepository,
            PatientProfileRepository patientProfileRepository,
            UserRepository userRepository,
            DoctorPatientService relationshipService,
            ObjectMapper objectMapper,
            @Value("${aarogyam.inference.cbc-url}") String cbcBaseUrl
    ) {
        this.reportRepository = reportRepository;
        this.predictionRepository = predictionRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.userRepository = userRepository;
        this.relationshipService = relationshipService;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.create();
        this.cbcBaseUrl = cbcBaseUrl.replaceAll("/$", "");
    }

    @Transactional
    public CbcPredictionResponse predict(AuthPrincipal principal, CbcPredictRequest request) {
        User submitter = requireUser(principal);
        PatientProfile patient = resolvePatient(principal, request.patientId());
        Map<String, Object> assessment = assess(request);
        Map<String, Object> primary = requiredMap(assessment, "primary_prediction");
        Map<String, Object> modelInfo = optionalMap(assessment, "model_info");

        CbcReport report = reportRepository.save(toReport(patient, submitter, request));
        CbcPrediction prediction = new CbcPrediction();
        prediction.setCbcReport(report);
        prediction.setPredictedClass(requiredString(primary, "name"));
        prediction.setConfidence(decimal(primary.get("probability")));
        prediction.setSeverity(requiredString(assessment, "severity"));
        prediction.setProbabilitiesJson(writeJson(assessment.getOrDefault("all_primary_predictions", List.of())));
        prediction.setContributingFeaturesJson(writeJson(assessment.getOrDefault("contributing_factors", List.of())));
        prediction.setAssessmentJson(writeJson(assessment));
        prediction.setModelVersion(string(modelInfo.get("version"), "unknown"));
        return toResponse(predictionRepository.save(prediction));
    }

    @Transactional(readOnly = true)
    public List<CbcPredictionResponse> history(AuthPrincipal principal, String patientId) {
        String resolvedPatientId = patientId;
        if (resolvedPatientId == null || resolvedPatientId.isBlank()) {
            if (principal.getRole() != Role.PATIENT) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "patientId is required for doctors.");
            }
            resolvedPatientId = principal.getUserId();
        }
        relationshipService.requireAccessiblePatient(principal, resolvedPatientId);
        UUID patientUserId = parseId(resolvedPatientId, "Patient not found.");
        return predictionRepository.findByCbcReport_Patient_User_IdOrderByCreatedAtDesc(patientUserId)
                .stream().map(this::toResponse).toList();
    }

    public Map<String, Object> parseReport(AuthPrincipal principal, MultipartFile file) {
        requireUser(principal);
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A CBC report file is required.");
        }
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", file.getResource());
            Map<?, ?> parsed = restClient.post()
                    .uri(cbcBaseUrl + "/api/cbc/parse-report")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(builder.build())
                    .retrieve()
                    .body(Map.class);
            if (parsed == null) {
                throw unavailable();
            }
            return castMap(parsed);
        } catch (RestClientException exception) {
            throw unavailable();
        }
    }

    private Map<String, Object> assess(CbcPredictRequest request) {
        try {
            Map<?, ?> result = restClient.post()
                    .uri(cbcBaseUrl + "/api/cbc/assess")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(toModelPayload(request))
                    .retrieve()
                    .body(Map.class);
            if (result == null) {
                throw unavailable();
            }
            return castMap(result);
        } catch (RestClientException exception) {
            throw unavailable();
        }
    }

    private CbcReport toReport(PatientProfile patient, User submitter, CbcPredictRequest request) {
        CbcReport report = new CbcReport();
        report.setPatient(patient);
        report.setSubmittedBy(submitter);
        report.setAge(request.age());
        report.setHeight(request.height());
        report.setWeight(request.weight());
        report.setBmi(request.bmi());
        report.setHb(request.hb());
        report.setRbc(request.rbc());
        report.setWbc(request.wbc());
        report.setPlatelets(request.platelets());
        report.setNeutrophils(request.neutrophils());
        report.setLymphocytes(request.lymphocytes());
        report.setMonocytes(request.monocytes());
        report.setEosinophils(request.eosinophils());
        report.setBasophils(request.basophils());
        report.setMcv(request.mcv());
        report.setMch(request.mch());
        report.setMchc(request.mchc());
        report.setRdw(request.rdw());
        report.setSource("manual-entry");
        return report;
    }

    private PatientProfile resolvePatient(AuthPrincipal principal, String patientId) {
        if (principal.getRole() == Role.PATIENT) {
            return patientProfileRepository.findByUser_Id(parseId(principal.getUserId(), "Session is no longer valid."))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found."));
        }
        if (patientId == null || patientId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "patientId is required when a doctor submits CBC values.");
        }
        User patientUser = relationshipService.requireAccessiblePatient(principal, patientId);
        return patientProfileRepository.findByUser_Id(patientUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found."));
    }

    private User requireUser(AuthPrincipal principal) {
        return userRepository.findById(parseId(principal.getUserId(), "Session is no longer valid."))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session is no longer valid."));
    }

    private Map<String, Object> toModelPayload(CbcPredictRequest request) {
        Map<String, Object> input = new LinkedHashMap<>();
        input.put("Age", request.age());
        input.put("Height", request.height());
        input.put("Weight", request.weight());
        input.put("BMI", request.bmi());
        input.put("Hb", request.hb());
        input.put("RBC", request.rbc());
        input.put("WBC", request.wbc());
        input.put("Platelets", request.platelets());
        input.put("Neutrophils", request.neutrophils());
        input.put("Lymphocytes", request.lymphocytes());
        input.put("Monocytes", request.monocytes());
        input.put("Eosinophils", request.eosinophils());
        input.put("Basophils", request.basophils());
        input.put("MCV", request.mcv());
        input.put("MCH", request.mch());
        input.put("MCHC", request.mchc());
        input.put("RDW", request.rdw());
        return input;
    }

    private CbcPredictionResponse toResponse(CbcPrediction prediction) {
        return new CbcPredictionResponse(
                prediction.getCbcReport().getId().toString(),
                prediction.getCbcReport().getPatient().getUser().getId().toString(),
                prediction.getCreatedAt(),
                prediction.getPredictedClass(),
                prediction.getConfidence(),
                prediction.getSeverity(),
                listAsProbabilityMap(readList(prediction.getProbabilitiesJson())),
                readList(prediction.getContributingFeaturesJson()),
                prediction.getModelVersion(),
                readMap(prediction.getAssessmentJson())
        );
    }

    private Map<String, Object> listAsProbabilityMap(List<Map<String, Object>> predictions) {
        Map<String, Object> values = new LinkedHashMap<>();
        for (Map<String, Object> prediction : predictions) {
            Object name = prediction.get("name");
            if (name != null) values.put(name.toString(), prediction.get("probability"));
        }
        return values;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to store the CBC model result.", exception);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castMap(Map<?, ?> map) {
        return (Map<String, Object>) map;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> requiredMap(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (!(value instanceof Map<?, ?> nested)) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The CBC model returned an incomplete response.");
        }
        return (Map<String, Object>) nested;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> optionalMap(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value instanceof Map<?, ?> nested ? (Map<String, Object>) nested : Map.of();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> readList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, List.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Stored CBC prediction data could not be read.", exception);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readMap(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Stored CBC prediction data could not be read.", exception);
        }
    }

    private BigDecimal decimal(Object value) {
        if (value instanceof Number number) return BigDecimal.valueOf(number.doubleValue());
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The CBC model returned an invalid confidence value.");
    }

    private String requiredString(Map<String, Object> values, String key) {
        String value = string(values.get(key), "");
        if (value.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The CBC model returned an incomplete response.");
        return value;
    }

    private String string(Object value, String fallback) {
        return value == null ? fallback : value.toString();
    }

    private UUID parseId(String value, String message) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "CBC analysis is temporarily unavailable. Please try again later.");
    }
}
