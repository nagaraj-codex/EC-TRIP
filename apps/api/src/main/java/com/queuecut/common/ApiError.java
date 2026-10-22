package com.queuecut.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiError(ErrorCode code, String message, Map<String, String> fields) {
    public ApiError(ErrorCode code, String message) {
        this(code, message, null);
    }
}
