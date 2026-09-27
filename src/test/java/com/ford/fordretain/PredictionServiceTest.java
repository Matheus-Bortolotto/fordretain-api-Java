package com.ford.fordretain;

import com.ford.fordretain.dao.ClienteDAO;
import com.ford.fordretain.dao.PredicaoDAO;
import com.ford.fordretain.dto.ClienteRequestDTO;
import com.ford.fordretain.dto.PredicaoResponseDTO;
import com.ford.fordretain.exception.ClienteJaCadastradoException;
import com.ford.fordretain.model.Cliente;
import com.ford.fordretain.model.Predicao;
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
    private ClienteDAO clienteDAO;

    @Mock
    private PredicaoDAO predicaoDAO;

    @Mock private com.ford.fordretain.service.LocalModel localModel;

    @InjectMocks
    private PredictionService predictionService;

    private ClienteRequestDTO request;

    @BeforeEach
    void setUp() {
        lenient().when(localModel.predict(any())).thenReturn(java.util.Map.of("FIEL", new BigDecimal("0.08"), "ABANDONO",new BigDecimal("0.68"),"ESQUECIDO",new BigDecimal("0.15"),"ECONOMICO",new BigDecimal("0.09")));
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
    @DisplayName("Deve retornar perfil ABANDONO quando o modelo seleciona ABANDONO")
    void deveRetornarPerfilAbandonoParaClienteNovoOnline() {
        when(clienteDAO.existsByEmail(any())).thenReturn(false);

        Cliente clienteSalvo = Cliente.builder()
                .id(1L).nome(request.getNome()).email(request.getEmail())
                .regiao(request.getRegiao()).idade(request.getIdade())
                .canalCompra(request.getCanalCompra()).formaPagamento(request.getFormaPagamento())
                .modeloVeiculo(request.getModeloVeiculo()).dataCompra(request.getDataCompra())
                .historicoMarca(request.getHistoricoMarca()).build();
        when(clienteDAO.save(any(Cliente.class))).thenReturn(clienteSalvo);

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
        when(predicaoDAO.save(any(Predicao.class))).thenReturn(predicaoSalva);

        PredicaoResponseDTO resultado = predictionService.predict(request);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getPerfilPrevisto()).isEqualTo("ABANDONO");
        assertThat(resultado.getScoreRisco()).isGreaterThan(50);
        assertThat(resultado.getAcaoSugerida()).isNotBlank();
        verify(clienteDAO, times(1)).save(any());
        verify(predicaoDAO, times(1)).save(any());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar cadastrar e-mail duplicado")
    void deveLancarExcecaoEmailDuplicado() {
        when(clienteDAO.existsByEmail(request.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> predictionService.predict(request))
                .isInstanceOf(ClienteJaCadastradoException.class)
                .hasMessageContaining(request.getEmail());

        verify(clienteDAO, never()).save(any());
    }

    @Test
    @DisplayName("Deve retornar perfil FIEL quando o modelo seleciona FIEL")
    void deveRetornarPerfilFielParaRecompra() {
        when(localModel.predict(any())).thenReturn(java.util.Map.of("FIEL",new BigDecimal(".65"),"ABANDONO",new BigDecimal(".08"),"ESQUECIDO",new BigDecimal(".12"),"ECONOMICO",new BigDecimal(".15")));
        request.setHistoricoMarca("RECOMPRA");
        request.setCanalCompra("CONCESSIONARIA");

        when(clienteDAO.existsByEmail(any())).thenReturn(false);

        Cliente clienteSalvo = Cliente.builder()
                .id(2L).nome(request.getNome()).email(request.getEmail())
                .regiao(request.getRegiao()).idade(request.getIdade())
                .canalCompra(request.getCanalCompra()).formaPagamento(request.getFormaPagamento())
                .modeloVeiculo(request.getModeloVeiculo()).dataCompra(request.getDataCompra())
                .historicoMarca(request.getHistoricoMarca()).build();
        when(clienteDAO.save(any(Cliente.class))).thenReturn(clienteSalvo);

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
        when(predicaoDAO.save(any(Predicao.class))).thenReturn(predicaoSalva);

        PredicaoResponseDTO resultado = predictionService.predict(request);

        assertThat(resultado.getPerfilPrevisto()).isEqualTo("FIEL");
        assertThat(resultado.getScoreRisco()).isLessThan(30);
    }

    @Test
    @DisplayName("Deve retornar perfil ESQUECIDO quando o modelo seleciona ESQUECIDO")
    void deveRetornarPerfilEsquecidoParaConsorcio() {
        when(localModel.predict(any())).thenReturn(java.util.Map.of("FIEL",new BigDecimal(".15"),"ABANDONO",new BigDecimal(".10"),"ESQUECIDO",new BigDecimal(".60"),"ECONOMICO",new BigDecimal(".15")));
        request.setHistoricoMarca("PRIMEIRA_COMPRA");
        request.setCanalCompra("CONCESSIONARIA");
        request.setFormaPagamento("CONSORCIO");

        when(clienteDAO.existsByEmail(any())).thenReturn(false);

        Cliente clienteSalvo = Cliente.builder()
                .id(3L).nome(request.getNome()).email(request.getEmail())
                .regiao(request.getRegiao()).idade(request.getIdade())
                .canalCompra(request.getCanalCompra()).formaPagamento(request.getFormaPagamento())
                .modeloVeiculo(request.getModeloVeiculo()).dataCompra(request.getDataCompra())
                .historicoMarca(request.getHistoricoMarca()).build();
        when(clienteDAO.save(any(Cliente.class))).thenReturn(clienteSalvo);

        Predicao predicaoSalva = Predicao.builder()
                .id(3L).cliente(clienteSalvo)
                .perfilPrevisto("ESQUECIDO")
                .probFiel(new BigDecimal("0.1500"))
                .probAbandono(new BigDecimal("0.1000"))
                .probEsquecido(new BigDecimal("0.6000"))
                .probEconomico(new BigDecimal("0.1500"))
                .acaoSugerida("Enviar lembrete com agendamento fácil")
                .scoreRisco(42)
                .dataPredicao(LocalDateTime.now())
                .build();
        when(predicaoDAO.save(any(Predicao.class))).thenReturn(predicaoSalva);

        PredicaoResponseDTO resultado = predictionService.predict(request);

        assertThat(resultado.getPerfilPrevisto()).isEqualTo("ESQUECIDO");
        assertThat(resultado.getScoreRisco()).isGreaterThan(30);
        assertThat(resultado.getScoreRisco()).isLessThan(70);
    }

    @Test
    @DisplayName("Deve retornar perfil ECONOMICO quando o modelo seleciona ECONOMICO")
    void deveRetornarPerfilEconomicoParaCenarioPadrao() {
        when(localModel.predict(any())).thenReturn(java.util.Map.of("FIEL",new BigDecimal(".20"),"ABANDONO",new BigDecimal(".15"),"ESQUECIDO",new BigDecimal(".15"),"ECONOMICO",new BigDecimal(".50")));
        request.setHistoricoMarca("PRIMEIRA_COMPRA");
        request.setCanalCompra("CONCESSIONARIA");
        request.setFormaPagamento("FINANCIAMENTO");

        when(clienteDAO.existsByEmail(any())).thenReturn(false);

        Cliente clienteSalvo = Cliente.builder()
                .id(4L).nome(request.getNome()).email(request.getEmail())
                .regiao(request.getRegiao()).idade(request.getIdade())
                .canalCompra(request.getCanalCompra()).formaPagamento(request.getFormaPagamento())
                .modeloVeiculo(request.getModeloVeiculo()).dataCompra(request.getDataCompra())
                .historicoMarca(request.getHistoricoMarca()).build();
        when(clienteDAO.save(any(Cliente.class))).thenReturn(clienteSalvo);

        Predicao predicaoSalva = Predicao.builder()
                .id(4L).cliente(clienteSalvo)
                .perfilPrevisto("ECONOMICO")
                .probFiel(new BigDecimal("0.2000"))
                .probAbandono(new BigDecimal("0.1500"))
                .probEsquecido(new BigDecimal("0.1500"))
                .probEconomico(new BigDecimal("0.5000"))
                .acaoSugerida("Enviar cupom de desconto")
                .scoreRisco(25)
                .dataPredicao(LocalDateTime.now())
                .build();
        when(predicaoDAO.save(any(Predicao.class))).thenReturn(predicaoSalva);

        PredicaoResponseDTO resultado = predictionService.predict(request);

        assertThat(resultado.getPerfilPrevisto()).isEqualTo("ECONOMICO");
        assertThat(resultado.getScoreRisco()).isLessThan(50);
    }
}