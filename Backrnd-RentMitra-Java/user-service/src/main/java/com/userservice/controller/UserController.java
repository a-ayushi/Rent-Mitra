package com.userservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.userservice.service.IUserService;
import com.userservice.dto.UserDto;
import com.userservice.entity.User;
import com.userservice.request.UserRequest;
import com.userservice.response.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private IUserService userService;

    @GetMapping("/get-user")
    public String userTestController(){
        return "This is User Service Controller";
    }

    @PostMapping(value = "/add-or-update", consumes = "multipart/form-data")
    public ResponseEntity<UserResponse> createUserApi(
            @RequestPart("data") String userData, // Accept JSON as String
            @RequestPart("image") MultipartFile image) {
        try {
            // Parse JSON into UserRequest object
            ObjectMapper objectMapper = new ObjectMapper();
            UserRequest userRequest = objectMapper.readValue(userData, UserRequest.class);

            // Call the service
            String msg = userService.createOrUpdateUser(userRequest, image);
            return new ResponseEntity<>(new UserResponse(msg, null), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(new UserResponse(e.getMessage(), " ! Creation failed"), HttpStatus.CONFLICT);
        }
    }


    @GetMapping("/get-by-id")
    public ResponseEntity<UserResponse> getByIdApi(@RequestParam Integer id){
        try{
          User user =   userService.getById(id);
            UserDto userDto = userService.convertodto(user);
            return  new ResponseEntity<>(new UserResponse(userDto,"! Success"),HttpStatus.OK);
        }
        catch (Exception e){
            return new ResponseEntity<>(new UserResponse(e.getMessage(),"!Failed"),HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/get-by-email")
    public ResponseEntity<UserResponse> getByEmailApi(@RequestParam String email){
        try{
            User user =   userService.getByEmail(email);
            UserDto userDto = userService.convertodto(user);
            return  new ResponseEntity<>(new UserResponse(userDto,"! Success"),HttpStatus.OK);
        }
        catch (Exception e){
            return new ResponseEntity<>(new UserResponse(e.getMessage(),"!Failed"),HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/get-by-phonenumber")
    public ResponseEntity<UserResponse> getByIdApi(@RequestParam String phonenumber){
        try{
            User user =   userService.getByPhoneNumber(phonenumber);
            UserDto userDto = userService.convertodto(user);
            return  new ResponseEntity<>(new UserResponse(userDto,"! Success"),HttpStatus.OK);
        }
        catch (Exception e){
            return new ResponseEntity<>(new UserResponse(e.getMessage(),"!Failed"),HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/delete")
    public String deleteAllApi(){
        return userService.deleteAll();
    }

    @GetMapping("/get-all")
    public ResponseEntity<UserResponse> getAllUsersApi() {
        try {
            List<User> users = userService.getAllUsers();
            List<UserDto> userDtos = users.stream()
                    .map(userService::convertodto)
                    .toList();
            return new ResponseEntity<>(new UserResponse(userDtos, "! Success"), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new UserResponse(e.getMessage(), "!Failed"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}


