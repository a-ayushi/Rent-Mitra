package com.userservice.service;

import com.userservice.dto.UserDto;
import com.userservice.entity.User;
import com.userservice.request.UserRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


public interface IUserService {

    public String createOrUpdateUser(UserRequest userRequest, MultipartFile image);

    public User getById(Integer id);

    public User getByName(String name);

    public User getByEmail(String email);

    public User getByPhoneNumber(String phoneNumber);

    public String deleteAll();

    public UserDto convertodto(User user);

    public List<User> getAllUsers();

}
