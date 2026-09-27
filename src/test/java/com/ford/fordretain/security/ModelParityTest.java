package com.ford.fordretain.security;
import com.ford.fordretain.service.LocalModel;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
class ModelParityTest {
    @Test void javaMatchesPythonReference() throws Exception {
        ObjectMapper mapper=new ObjectMapper();LocalModel model=new LocalModel();
        var rows=mapper.readTree(getClass().getResourceAsStream("/ml/golden.json"));
        for(var row:rows) {
            Map<String,Object> input=mapper.convertValue(row.get("input"),Map.class);
            var actual=model.predict(input);
            for(var e:actual.entrySet())assertEquals(row.get("probabilities").get(e.getKey()).asDouble(),e.getValue().doubleValue(),1e-10);
            assertEquals(1,actual.values().stream().mapToDouble(java.math.BigDecimal::doubleValue).sum(),1e-10);
        }
    }
}
