package com.userservice.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserRequest {

    private String name;

    private String email;

    private String facebook_id;

    private String mobile_number;

    private MultipartFile image;

}
