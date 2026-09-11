package ai.aarogyam.api.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import ai.aarogyam.api.dto.CbcPredictRequest;
import ai.aarogyam.api.dto.CbcPredictionResponse;
import ai.aarogyam.api.security.AuthPrincipal;
import ai.aarogyam.api.service.CbcService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cbc")
public class CbcController {

    private final CbcService cbcService;

    public CbcController(CbcService cbcService) {
        this.cbcService = cbcService;
    }

    @PostMapping("/predict")
    public CbcPredictionResponse predict(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody CbcPredictRequest request
    ) {
        return cbcService.predict(principal, request);
    }

    @PostMapping(path = "/parse-report", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> parseReport(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestPart("file") MultipartFile file
    ) {
        return cbcService.parseReport(principal, file);
    }

    @GetMapping("/history")
    public List<CbcPredictionResponse> history(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(value = "patientId", required = false) String patientId
    ) {
        return cbcService.history(principal, patientId);
    }
}
