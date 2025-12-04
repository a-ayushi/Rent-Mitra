package com.rentmitra.rmproduct.controller;

import com.rentmitra.rmproduct.service.ConnectionCleanupService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/connections")
public class ConnectionCleanupController {
    private final ConnectionCleanupService connectionCleanupService;

    public ConnectionCleanupController(ConnectionCleanupService connectionCleanupService) {
        this.connectionCleanupService = connectionCleanupService;
    }

    @GetMapping("/cleanup-idle")
    public String cleanupIdleConnections() {
        return connectionCleanupService.terminateIdleConnections();
    }
}
