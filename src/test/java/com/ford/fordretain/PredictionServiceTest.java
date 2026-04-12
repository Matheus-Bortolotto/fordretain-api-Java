package com.ford.fordretain;

import com.ford.fordretain.dto.ClienteRequestDTO;
import com.ford.fordretain.dto.PredicaoResponseDTO;
import com.ford.fordretain.exception.ClienteJaCadastradoException;
import com.ford.fordretain.model.Cliente;
import com.ford.fordretain.model.Predicao;
import com.ford.fordretain.repository.ClienteRepository;
import com.ford.fordretain.repository.PredicaoRepository;
import com.ford.fordretain.service.PredictionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PredictionServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private PredicaoRepository predicaoRepository;

    @InjectMocks
    private PredictionService predictionService;

    private ClienteRequestDTO request;

    @BeforeEach
    void setUp() {
        request = new ClienteRequestDTO();
        request.setNome("Test User");
        request.setEmail("test@email.com");
        request.setTelefone("11999990000");
        request.setRegiao("SP");
        request.setIdade(30);
        request.setCanalCompra("ONLINE");
        request.setFormaPagamento("FINANCIAMENTO");
        request.setModeloVeiculo("RANGER");
        request.setDataCompra(LocalDate.now());
        request.setHistoricoMarca("PRIMEIRA_COMPRA");
    }

    @Test
    @DisplayName("Deve retornar perfil ABANDONO para cliente novo via canal online")
    void deveRetornarPerfilAbandonoParaClienteNovoOnline() {
        // Arrange
        when(clienteRepository.existsByEmail(any())).thenReturn(false);

        Cliente clienteSalvo = Cliente.builder()
                .id(1L).nome(request.getNome()).email(request.getEmail())
                .regiao(request.getRegiao()).idade(request.getIdade())
                .canalCompra(request.getCanalCompra()).formaPagamento(request.getFormaPagamento())
                .modeloVeiculo(request.getModeloVeiculo()).dataCompra(request.getDataCompra())
                .historicoMarca(request.getHistoricoMarca()).build();
        when(clienteRepository.save(any(Cliente.class))).thenReturn(clienteSalvo);

        Predicao predicaoSalva = Predicao.builder()
                .id(1L).cliente(clienteSalvo)
                .perfilPrevisto("ABANDONO")
                .probFiel(new BigDecimal("0.0800"))
                .probAbandono(new BigDecimal("0.6800"))
                .probEsquecido(new BigDecimal("0.1500"))
                .probEconomico(new BigDecimal("0.0900"))
                .acaoSugerida("Contato imediato")
                .scoreRisco(68)
                .dataPredicao(LocalDateTime.now())
                .build();
        when(predicaoRepository.save(any(Predicao.class))).thenReturn(predicaoSalva);

        // Act
        PredicaoResponseDTO resultado = predictionService.predict(request);

        // Assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.getPerfilPrevisto()).isEqualTo("ABANDONO");
        assertThat(resultado.getScoreRisco()).isGreaterThan(50);
        assertThat(resultado.getAcaoSugerida()).isNotBlank();
        verify(clienteRepository, times(1)).save(any());
        verify(predicaoRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar cadastrar e-mail duplicado")
    void deveLancarExcecaoEmailDuplicado() {
        // Arrange
        when(clienteRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> predictionService.predict(request))
                .isInstanceOf(ClienteJaCadastradoException.class)
                .hasMessageContaining(request.getEmail());

        verify(clienteRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve retornar perfil FIEL para cliente com histórico de recompra")
    void deveRetornarPerfilFielParaRecompra() {
        // Arrange
        request.setHistoricoMarca("RECOMPRA");
        request.setCanalCompra("CONCESSIONARIA");

        when(clienteRepository.existsByEmail(any())).thenReturn(false);

        Cliente clienteSalvo = Cliente.builder()
                .id(2L).nome(request.getNome()).email(request.getEmail())
                .regiao(request.getRegiao()).idade(request.getIdade())
                .canalCompra(request.getCanalCompra()).formaPagamento(request.getFormaPagamento())
                .modeloVeiculo(request.getModeloVeiculo()).dataCompra(request.getDataCompra())
                .historicoMarca(request.getHistoricoMarca()).build();
        when(clienteRepository.save(any(Cliente.class))).thenReturn(clienteSalvo);

        Predicao predicaoSalva = Predicao.builder()
                .id(2L).cliente(clienteSalvo)
                .perfilPrevisto("FIEL")
                .probFiel(new BigDecimal("0.6500"))
                .probAbandono(new BigDecimal("0.0800"))
                .probEsquecido(new BigDecimal("0.1200"))
                .probEconomico(new BigDecimal("0.1500"))
                .acaoSugerida("Programa de fidelidade premium")
                .scoreRisco(7)
                .dataPredicao(LocalDateTime.now())
                .build();
        when(predicaoRepository.save(any(Predicao.class))).thenReturn(predicaoSalva);

        // Act
        PredicaoResponseDTO resultado = predictionService.predict(request);

        // Assert
        assertThat(resultado.getPerfilPrevisto()).isEqualTo("FIEL");
        assertThat(resultado.getScoreRisco()).isLessThan(30);
    }
}
