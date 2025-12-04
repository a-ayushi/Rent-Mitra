package com.userservice.repository;

import com.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IUserRepository extends JpaRepository<User,Integer> {

    boolean existsByEmail(String email);

    boolean existsByMobilenumber(String mobile_number);

    public User findByName(String name);

    public User findByEmail(String email);

//    public User findBymobile_number(Long phonenumber);
//    User findByMobilenumber(String mobile_number);

    Optional<User> findByMobilenumber(String mobilenumber);

}

