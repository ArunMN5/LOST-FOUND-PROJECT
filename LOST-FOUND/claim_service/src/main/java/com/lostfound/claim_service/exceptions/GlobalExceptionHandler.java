package com.lostfound.claim_service.exceptions;

import com.lostfound.claim_service.dto.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Response> handleException(Exception ex) {

        Response response = new Response(
                ex.getMessage(),
                false,
                HttpStatus.INTERNAL_SERVER_ERROR,
                null
        );

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
