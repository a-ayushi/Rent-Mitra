package com.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    private Integer user_id;

    private String name;

    private String email;

    private String facebook_id;

    private String mobilenumber;

    private LocalDate createdAt;

    private String imageUrls;

}
