package com.lostfound.lost_item_service.exceptions;

import com.lostfound.lost_item_service.dto.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Response> handleValidationException(
            MethodArgumentNotValidException exception) {

        String message = exception
                .getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        Response response = new Response(
                message,
                false,
                HttpStatus.BAD_REQUEST,
                null
        );

        return new ResponseEntity<>(
                response,
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Response> handleException(Exception exception) {

        Response response = new Response(
                exception.getMessage(),
                false,
                HttpStatus.INTERNAL_SERVER_ERROR,
                null
        );

        return new ResponseEntity<>(
                response,
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}