import { P10_TABLE, P8_TABLE } from "./constants.js";
import { permute } from "./sdes_utils.js";

export class KeyGenerator {
    static generateKeys(masterKey) {
        let logs = [];

        // 1. P10 Permutation
        let p10 = permute(masterKey, P10_TABLE);
        logs.push({ 
            title: "KEY GENERATION: P10-Permutation", 
            prev: masterKey, 
            val: p10, 
            desc: "The 10-bit key is rearranged using the P10 table. Each output bit is taken from a specific input position."
        });

        // 2. LS-1 ADIMI (Kutulu görünüm için gerekli tüm veriler burada)
        let l_old = p10.substring(0, 5);
        let r_old = p10.substring(5);

        let l_new = l_old.substring(1) + l_old[0]; 
        let r_new = r_old.substring(1) + r_old[0];
        
        let k1_input = l_new + r_new;

        logs.push({ 
            title: "KEY GENERATION: LS-1(Left Shift 1)", 
            val: k1_input,
            l_prev: l_old, 
            r_prev: r_old,
            l_val: l_new, 
            r_val: r_new,
            desc: "The P10 result is split into two 5-bit halves. Each half is rotated left by 1 position (circular shift)." 
        });

        // 3. K1 Üretimi
        let k1 = permute(k1_input, P8_TABLE);
        logs.push({ title: "KEY GENERATION: P8 → SUBKEY K1", val: k1, desc: "P8 selects 8 of the 10 bits from the LS-1 output in a specific order, producing the first round subkey K1." });

        // 4. LS-2 ADIMI
        let l_ls2 = l_new.substring(2) + l_new.substring(0, 2); 
        let r_ls2 = r_new.substring(2) + r_new.substring(0, 2);
        let k2_input = l_ls2 + r_ls2;

        logs.push({ 
            title: "KEY GENERATION: LS-2 (Left Shift 2)", 
            val: k2_input, 
            l_prev: l_new,
            r_prev: r_new,
            l_val: l_ls2,
            r_val: r_ls2,
            desc: "Starting from the LS-1 state, each 5-bit half is rotated left by 2 more positions to prepare K2." 
        });

        // 5. K2 Üretimi
        let k2 = permute(k2_input, P8_TABLE);
        logs.push({ title: "KEY GENERATION: P8 → SUBKEY K2", val: k2, desc: "Apply P8 again to the LS-2 result to produce K2. We now have both round subkeys K1 and K2." });

        return { keys: { k1, k2 }, logs };
    }
}