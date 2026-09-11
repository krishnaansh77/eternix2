package ai.aarogyam.api.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CbcPredictRequest(
        String patientId,
        @NotNull @Min(value = 1, message = "Age must be between 1 and 120.") @Max(value = 120, message = "Age must be between 1 and 120.") Integer age,
        @NotNull @DecimalMin(value = "1", message = "Height must be greater than zero.") BigDecimal height,
        @NotNull @DecimalMin(value = "1", message = "Weight must be greater than zero.") BigDecimal weight,
        @NotNull @DecimalMin(value = "1", message = "BMI must be greater than zero.") BigDecimal bmi,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal hb,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal rbc,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal wbc,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal platelets,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal neutrophils,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal lymphocytes,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal monocytes,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal eosinophils,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal basophils,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal mcv,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal mch,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal mchc,
        @DecimalMin(value = "0", message = "CBC values cannot be negative.") BigDecimal rdw
) {
}
