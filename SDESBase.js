import * as Tables from "./constants.js";
import { permute, xor } from "./sdes_utils.js";

export class SDESBase {
    static encrypt(pt, keys) {
        let logs = [];
        let state = permute(pt, Tables.IP_TABLE);
        logs.push({ title: "IP: INITIAL PERMUTATION", val: state, desc: "8-bit veri IP tablosuna göre karıştırıldı." });

        state = this.fkProcess(state, keys.k1, "ROUND 1", logs);
        state = state.substring(4) + state.substring(0, 4);
        logs.push({ title: "SW: SWITCH BITS", val: state, desc: "Bloklar yer değiştirdi (Switching)." });

        state = this.fkProcess(state, keys.k2, "ROUND 2", logs);
        let final = permute(state, Tables.INVERSE_IP_TABLE);
        logs.push({ title: "RESULT: IP-1", val: final, desc: "Ters permütasyon uygulandı. Ciphertext hazır." });

        return { result: final, logs };
    }

    static fkProcess(bits, key, round, logs) {
        let L = bits.substring(0, 4), R = bits.substring(4);
        let ep = permute(R, Tables.EP_TABLE);
        logs.push({ title: `${round}: EP`, val: ep, desc: "Sağ blok 8-bit'e genişletildi (Expansion)." });

        let xored = xor(ep, key);
        logs.push({ title: `${round}: XOR`, val: xored, desc: "EP sonucu ile anahtar XOR'landı." });

        let s0In = xored.substring(0, 4), s1In = xored.substring(4);
        let s0R = parseInt(s0In[0] + s0In[3], 2), s0C = parseInt(s0In[1] + s0In[2], 2);
        let s0V = Tables.S0[s0R][s0C].toString(2).padStart(2, "0");
        logs.push({ title: `${round}: S-BOX 0`, val: s0V, desc: `S0 Giriş: ${s0In}. Satır: ${s0R}, Sütun: ${s0C}. Çıktı: ${s0V}` });

        let s1R = parseInt(s1In[0] + s1In[3], 2), s1C = parseInt(s1In[1] + s1In[2], 2);
        let s1V = Tables.S1[s1R][s1C].toString(2).padStart(2, "0");
        logs.push({ title: `${round}: S-BOX 1`, val: s1V, desc: `S1 Giriş: ${s1In}. Satır: ${s1R}, Sütun: ${s1C}. Çıktı: ${s1V}` });

        let p4 = permute(s0V + s1V, Tables.P4_TABLE);
        logs.push({ title: `${round}: P4`, val: p4, desc: "S-Box çıktıları birleştirilip P4'ten geçirildi." });

        let newL = xor(L, p4);
        return newL + R;
    }
}