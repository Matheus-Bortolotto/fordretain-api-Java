package com.ford.fordretain.service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.*;
@Component
public class LocalModel {
    private final JsonNode model;
    public LocalModel() {
        try (var in=LocalModel.class.getResourceAsStream("/ml/model.json")) {
            model=new ObjectMapper().readTree(in);
        } catch(Exception e) { throw new IllegalStateException("Modelo aprovado indisponível",e); }
    }
    public String version() { return model.get("version").asText(); }
    private String normalize(Object v) {
        if(v==null || v.toString().isBlank()) return "AUSENTE";
        return Normalizer.normalize(v.toString().trim().toUpperCase(Locale.ROOT),Normalizer.Form.NFKD)
            .replaceAll("\\p{M}","").replace(' ','_');
    }
    public Map<String,BigDecimal> predict(Map<String,Object> input) {
        List<Double> values=new ArrayList<>();
        Object age=input.get("idade");double a=age instanceof Number?((Number)age).doubleValue():Double.NaN;
        boolean missing=!Double.isFinite(a)||a<18||a>100;
        double[] numeric={missing?model.get("median").asDouble():a, missing?1:0};
        for(int i=0;i<model.get("mean").size();i++) values.add((numeric[i]-model.get("mean").get(i).asDouble())/model.get("scale").get(i).asDouble());
        for(int i=0;i<5;i++) {
            String v=normalize(input.get(model.get("features").get(i+1).asText()));
            for(JsonNode category:model.get("categories").get(i)) values.add(category.asText().equals(v)?1.0:0.0);
        }
        double[] logits=new double[4];
        for(int k=0;k<4;k++) {
            logits[k]=model.get("intercepts").get(k).asDouble();
            for(int j=0;j<values.size();j++)logits[k]+=values.get(j)*model.get("coefficients").get(k).get(j).asDouble();
        }
        double max=Arrays.stream(logits).max().orElseThrow(),sum=0;
        for(int k=0;k<4;k++) { logits[k]=Math.exp(logits[k]-max);sum+=logits[k]; }
        Map<String,BigDecimal> out=new LinkedHashMap<>();
        for(int k=0;k<4;k++)out.put(model.get("classes").get(k).asText(),BigDecimal.valueOf(logits[k]/sum));
        return out;
    }
}
