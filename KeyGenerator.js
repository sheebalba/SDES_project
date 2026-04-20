import { P10_TABLE, P8_TABLE } from "./constants.js";
import { permute } from "./sdes_utils.js";

export class KeyGenerator {
    static generateKeys(masterKey) {
        let logs = [];
        let p10 = permute(masterKey, P10_TABLE);
        logs.push({ title: "KEY GEN: P10", val: p10, desc: "Master Key P10 tablosuyla karıştırıldı." });

        let l = p10.substring(0, 5), r = p10.substring(5);
        l = l.substring(1) + l[0]; r = r.substring(1) + r[0];
        logs.push({ title: "KEY GEN: LS-1", val: l + r, desc: "Bloklar 1-bit dairesel sola kaydırıldı." });

        let k1 = permute(l + r, P8_TABLE);
        logs.push({ title: "KEY GEN: K1 RESULT", val: k1, desc: "K1 Alt Anahtarı (Subkey 1) üretildi." });

        l = l.substring(2) + l.substring(0, 2); r = r.substring(2) + r.substring(0, 2);
        logs.push({ title: "KEY GEN: LS-2", val: l + r, desc: "Bloklar 2-bit dairesel sola kaydırıldı." });

        let k2 = permute(l + r, P8_TABLE);
        logs.push({ title: "KEY GEN: K2 RESULT", val: k2, desc: "K2 Alt Anahtarı (Subkey 2) üretildi." });

        return { keys: { k1, k2 }, logs };
    }
}