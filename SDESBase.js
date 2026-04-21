import * as Tables from "./constants.js";
import { permute, xor } from "./sdes_utils.js";

export class SDESBase {
    static encrypt(pt, keys) {
        let logs = [];
        let state = permute(pt, Tables.IP_TABLE);
        logs.push({ title: "IP-INITIAL PERMUTATION", val: state, desc: "The 8-bit plaintext is rearranged using the IP table. This mixing step prepares data for the Feistel rounds." });
         
        let L = state.substring(0, 4);
    let R = state.substring(4);
    logs.push({ 
        title: "Split → L0 and R0", 
        val: `L0: ${L} | R0: ${R}`, 
        desc: "Split the IP result into two 4-bit halves: L0 (left 4 bits) and R0 (right 4 bits). This starts the Feistel structure." 
    });
         
        state = this.fkProcess(state, keys.k1, "Round 1",logs);

        logs.push({ 
        title: "Round 1: L0 ⊕ F → New Left", 
        val: state.substring(0, 4), 
        desc: "XOR L0 with F(R0,K1) to get the new left half. R0 remains unchanged as the new right half." 
    });
        state = state.substring(4) + state.substring(0, 4);
        logs.push({ title: "SW-Swap the Halves", val: state, desc: "The two halves swap roles: the current right (R0) becomes the new left, and the new left (L0⊕F) becomes the new right." });

        state = this.fkProcess(state, keys.k2, "Round 2", logs);
        logs.push({ 
        title: "Round 2: R0 ⊕ F → Final Halves", 
        val: state, 
        desc: "XOR the left half (R0 from SW) with F(R1,K2) to get the final left. The right half remains as R1." 
    });
    logs.push({ 
        title: "Combine Final Halves", 
        val: state, 
        desc: "Concatenate the final left and right 4-bit halves to form the 8-bit block before the final permutation." 
    });
        let final = permute(state, Tables.INVERSE_IP_TABLE);
        logs.push({ title: "IP⁻¹ — Final Permutation", val: final, desc: "Apply the inverse of IP to produce the final ciphertext. IP⁻¹ undoes the initial permutation, completing SDES." });

        return { result: final, logs };
    }

    static fkProcess(bits, key, round, logs) {
        let L = bits.substring(0, 4), R = bits.substring(4);
        let ep = permute(R, Tables.EP_TABLE);
        logs.push({ title: `${round}: EP Permutation`, val: ep, desc: "R0 (4 bits) is expanded to 8 bits using EP. Some bits are duplicated so we can XOR with the 8-bit key K1." });

    let xored = xor(ep, key);

// Key uzunluğuna veya round ismine göre K1/K2 seçimi yapalım
const keyName = round.includes("1") ? "K1" : "K2";

logs.push({ 
    title: `${round}: XOR with ${keyName}`, // Burası artık dinamik!
    val: xored, 
    desc: `The 8-bit expanded block is XORed with subkey ${keyName}. Using ${keyName} makes the two Feistel rounds cryptographically different.` 
});

        let s0In = xored.substring(0, 4), s1In = xored.substring(4);
        let s0R = parseInt(s0In[0] + s0In[3], 2), s0C = parseInt(s0In[1] + s0In[2], 2);
        let s0V = Tables.S0[s0R][s0C].toString(2).padStart(2, "0");
        logs.push({ title: `${round}: S0-Box Substitution`, 
    val: s0V, 
    desc: `The S0 value is determined by performing an XOR operation on the row (b1, b4) and column (b2, b3) indices to obtain the resulting value.\n--S0 Input: ${s0In}   Row: ${s0R}   Column: ${s0C}   : ${s0V}--` });

        let s1R = parseInt(s1In[0] + s1In[3], 2), s1C = parseInt(s1In[1] + s1In[2], 2);
        let s1V = Tables.S1[s1R][s1C].toString(2).padStart(2, "0");
        logs.push({ title: `${round}: S1-Box Substitution`, val: s1V, desc: `The S1 value is determined by performing an XOR operation on the row (b1, b4) and column (b2, b3) indices to obtain the resulting value.\n--S1 Input: ${s0In}   Row: ${s0R}   Column: ${s0C}   Output: ${s0V}--` });

        let p4 = permute(s0V + s1V, Tables.P4_TABLE);
        logs.push({ title: `${round}: P4 → Function F`, val: p4, desc: "Apply P4 to the 4-bit S-box output. This is the result of F(R0, K1) — the Feistel round function." });

        let newL = xor(L, p4);

        return newL + R;
    }
}