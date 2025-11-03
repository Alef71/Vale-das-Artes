package br.com.valedasartes.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        
        // 1. Mapeamento para os recursos estáticos (HTML, JS, CSS, etc.)
        // Isso resolve o 404 ao direcionar o Spring para as pastas padrão de frontend.
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/", "classpath:/public/")
                .setCachePeriod(0); // Útil para garantir que o navegador não use cache antigo no desenvolvimento

        // 2. Mapeamento para os uploads (arquivos do sistema de arquivos)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}