package com.queuecut.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.slf4j.MDC;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(boolean ok, T data, ApiError error, String requestId) {
    
    public static <T> ApiResponse<T> success(T data) {
        String reqId = MDC.get("requestId");
        return new ApiResponse<>(true, data, null, reqId != null ? reqId : "unknown");
    }
    
    public static ApiResponse<Void> error(ApiError error) {
        String reqId = MDC.get("requestId");
        return new ApiResponse<>(false, null, error, reqId != null ? reqId : "unknown");
    }
}
