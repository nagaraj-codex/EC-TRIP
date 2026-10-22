package com.queuecut.common;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApi(ApiException e) {
        ErrorCode code = switch (e.getStatus()) {
            case 400 -> ErrorCode.BAD_REQUEST;
            case 401 -> ErrorCode.AUTH_REQUIRED;
            case 403 -> ErrorCode.FORBIDDEN;
            case 404 -> ErrorCode.NOT_FOUND;
            case 409 -> ErrorCode.CONFLICT;
            default -> ErrorCode.INTERNAL_ERROR;
        };
        return ResponseEntity.status(e.getStatus())
                .body(ApiResponse.error(new ApiError(code, e.getMessage())));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> fields = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(f -> fields.put(f.getField(), f.getDefaultMessage()));
        return ResponseEntity.status(422)
                .body(ApiResponse.error(new ApiError(ErrorCode.VALIDATION_ERROR, "Validation failed", fields)));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraint(ConstraintViolationException e) {
        return ResponseEntity.status(422)
                .body(ApiResponse.error(new ApiError(ErrorCode.VALIDATION_ERROR, e.getMessage())));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleIntegrity(DataIntegrityViolationException e) {
        return ResponseEntity.status(409)
                .body(ApiResponse.error(new ApiError(ErrorCode.CONFLICT, "A data conflict occurred (e.g. duplicate email)")));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception e) {
        log.error("Unhandled exception caught by GlobalExceptionHandler: {}", e.getMessage(), e);
        return ResponseEntity.status(500)
                .body(ApiResponse.error(new ApiError(ErrorCode.INTERNAL_ERROR, "Internal server error")));
    }
}