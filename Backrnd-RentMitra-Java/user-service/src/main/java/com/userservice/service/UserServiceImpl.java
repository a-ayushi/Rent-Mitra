package com.userservice.service;
import com.userservice.request.UserRequest;
import com.userservice.repository.IUserRepository;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.userservice.entity.User;
import com.userservice.dto.UserDto;
import com.userservice.exceptions.UserNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements IUserService {

    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public UserServiceImpl() {
    }


    @Override
    @Transactional
    public String createOrUpdateUser(UserRequest userRequest, MultipartFile image) {
        // Check if a user with the provided mobile number already exists
        Optional<User> existingUserOptional = userRepository.findByMobilenumber(userRequest.getMobile_number());

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            // Upload image to Cloudinary and get the URL
            imageUrl = cloudinaryService.uploadImage(image);
        }

        if (existingUserOptional.isPresent()) {
            // User exists, perform an update
            User existingUser = existingUserOptional.get();
            existingUser.setName(userRequest.getName());
            existingUser.setEmail(userRequest.getEmail());
            existingUser.setFacebook_id(userRequest.getFacebook_id());
            if (imageUrl != null) {
                existingUser.setImageUrls(imageUrl);
            }
            userRepository.save(existingUser);
            return "User updated with id: " + existingUser.getUser_id();
        } else {
            // User does not exist, create a new user
            User newUser = new User();
            newUser.setName(userRequest.getName());
            newUser.setEmail(userRequest.getEmail());
            newUser.setMobilenumber(userRequest.getMobile_number());
            newUser.setFacebook_id(userRequest.getFacebook_id());
            if (imageUrl != null) {
                newUser.setImageUrls(imageUrl);
            }
            userRepository.save(newUser);
            return "User created with id: " + newUser.getUser_id();
        }
    }


    @Override
    public User getById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(()->new UserNotFoundException("! User not found with id :"+id));
    }

    @Override
    public User getByName(String name) {
        return Optional.of(userRepository.findByName(name))
                .orElseThrow(()->new UserNotFoundException("! User Not found with name :"+name));

    }

    @Override
    public User getByEmail(String email) {
        return Optional.ofNullable(userRepository.findByEmail(email))
                .orElseThrow(()->new UserNotFoundException("! User Not Found with email :"+email));
    }

    @Override
    public User getByPhoneNumber(String phoneNumber) {
        return userRepository.findByMobilenumber(phoneNumber)
                .orElseThrow(()->new UserNotFoundException("! User is not available with phone number :"+phoneNumber));
    }

    @Override
    public String deleteAll() {

        userRepository.deleteAll();
        return "record deleted";
    }

    @Override
    public UserDto convertodto(User user) {
        return modelMapper.map(user,UserDto.class);

    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

}