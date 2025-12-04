# User-Service
port=8087

src
└── main
    ├── java
    │   └── com
    │       └── example
    │           └── userservice
    │               ├── config
    │               │   └── SecurityConfig.java
    │               ├── controller
    │               │   └── AuthController.java
    │               ├── dto
    │               │   └── LoginRequest.java
    │               ├── entity
    │               │   ├── Role.java
    │               │   └── User.java
    │               ├── repository
    │               │   ├── RoleRepository.java
    │               │   └── UserRepository.java
    │               ├── security
    │               │   ├── JwtAuthenticationFilter.java
    │               │   ├── JwtTokenProvider.java
    │               │   └── UserDetailsServiceImpl.java
    │               ├── service
    │               │   └── UserService.java
    │               └── UserserviceApplication.java
    └── resources
        ├── application.properties
        └── schema.sql
