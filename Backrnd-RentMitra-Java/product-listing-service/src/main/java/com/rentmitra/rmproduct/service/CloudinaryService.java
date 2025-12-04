package com.rentmitra.rmproduct.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public List<String> uploadImage(List<MultipartFile> imagefiles) throws IOException {

      return  imagefiles.stream().map(files->{
          try{
              Map uploadParams = ObjectUtils.asMap(
                      "quality", "auto:best",
                      "resource_type", "image"
              );
              Map uploadResult = cloudinary.uploader().
                      upload(files.getBytes(), uploadParams);
             return uploadResult.get("url").toString();
          } catch (Exception e) {
              throw new RuntimeException(e);
          }
      }).collect(Collectors.toList());
    }

    public String uploadImage(MultipartFile file){
        try{
            Map uploadParams = ObjectUtils.asMap(
                    "quality", "auto:best",
                    "resource_type", "image"
            );
            Map uploadResult = cloudinary.uploader().
                    upload(file.getBytes(), uploadParams);
            return uploadResult.get("url").toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
