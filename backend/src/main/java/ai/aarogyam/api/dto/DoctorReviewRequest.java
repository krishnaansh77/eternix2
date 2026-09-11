package ai.aarogyam.api.dto;

public record DoctorReviewRequest(
        boolean confirmed,
        String correction
) {
    public void validate() {
        if (!confirmed && (correction == null || correction.isBlank())) {
            throw new IllegalArgumentException("A correction note is required when the prediction is not confirmed.");
        }
    }
}
