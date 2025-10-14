package br.com.valedasartes.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.valedasartes.domain.relatorio.dto.RelatorioArtesaoDTO;
import br.com.valedasartes.domain.relatorio.service.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/relatorios")
@Tag(name = "Relatórios", description = "Endpoints para geração de relatórios financeiros")
public class RelatorioController {

    private final RelatorioService relatorioService;

    @Autowired
    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @Operation(summary = "Gera um relatório financeiro para um artesão",
               description = "Retorna um relatório detalhado com o total vendido, total de comissões, total a receber e a lista de todas as vendas para um artista específico.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Relatório gerado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Artista não encontrado com o ID informado")
    })
    @GetMapping("/artesao/{artistaId}")
    public ResponseEntity<RelatorioArtesaoDTO> getRelatorioArtesao(
            @Parameter(description = "ID do artista para o qual o relatório será gerado") @PathVariable Long artistaId) {
        RelatorioArtesaoDTO relatorio = relatorioService.gerarRelatorioParaArtesao(artistaId);
        return ResponseEntity.ok(relatorio);
    }
}