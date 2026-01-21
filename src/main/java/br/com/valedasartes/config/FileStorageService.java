package br.com.valedasartes.config; 

import java.io.IOException; 
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Não foi possível criar o diretório para salvar os arquivos.", ex);
        }
    }


    public String salvarArquivo(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        String extensao = "";
        
        
        if (originalFileName != null && originalFileName.contains(".")) {
             extensao = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String nomeArquivoUnico = UUID.randomUUID().toString() + extensao;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(nomeArquivoUnico);
            
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            
            return nomeArquivoUnico;

        } catch (IOException ex) {
            throw new RuntimeException("Não foi possível salvar o arquivo " + nomeArquivoUnico, ex);
        }
    }

    
    public String getUrlCompleta(String nomeArquivo) {
        if (nomeArquivo == null || nomeArquivo.isBlank()) {
            return null;
        }
        
        return ServletUriComponentsBuilder
                .fromCurrentContextPath() 
                .path("/uploads/") 
                .path(nomeArquivo)
                .toUriString();
    }
}