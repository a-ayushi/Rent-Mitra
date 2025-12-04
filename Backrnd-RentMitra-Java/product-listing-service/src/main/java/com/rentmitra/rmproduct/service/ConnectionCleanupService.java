package com.rentmitra.rmproduct.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class ConnectionCleanupService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public String terminateIdleConnections() {
        String terminateQuery = """
            SELECT pg_terminate_backend(pid) 
            FROM pg_stat_activity 
            WHERE state = 'idle' 
              AND pid <> pg_backend_pid();
            """;

        try {
            // Use execute() to run the query that doesn't return results
            jdbcTemplate.execute(terminateQuery);
            return "Successfully terminated idle connections.";
        } catch (Exception e) {
            return "Failed to terminate idle connections: " + e.getMessage();
        }
    }

}
