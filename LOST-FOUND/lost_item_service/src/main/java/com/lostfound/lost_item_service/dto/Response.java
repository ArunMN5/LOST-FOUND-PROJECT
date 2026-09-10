package com.lostfound.lost_item_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Response {

    private String message;
    private boolean status;
    private HttpStatus httpStatus;
    private Object data;
}
