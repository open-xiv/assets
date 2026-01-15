import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// props from environments
const DATA_PATH = process.env.DATA_PATH || ".";
const DIST_PATH = process.env.DIST_PATH || "public";

// build output directory
if (!fs.existsSync(path.join(DIST_PATH, "duty"))) {
    fs.mkdirSync(path.join(DIST_PATH, "duty"), {recursive: true});
}

async function build() {
    // common files
    // common/*.{json/png} -> public/*.{json/png}
    const commonDir = path.join(DATA_PATH, "common");
    if (fs.existsSync(commonDir)) {
        for (const f of fs.readdirSync(commonDir).filter(x => /\.(json|png)$/i.test(x))) {
            const dst = path.join(DIST_PATH, f);
            fs.copyFileSync(path.join(commonDir, f), dst);
            console.log(`${f} copied to ${dst}`);
        }
    } else {
        console.log(`directory ${commonDir} does not exist, skipping`);
    }
    
    // duty yaml files
    // duty/<name>.yaml -> public/duty/<zoneID>.json
    const dutyDir = path.join(DATA_PATH, "duty");
    if (fs.existsSync(dutyDir)) {
        for (const f of fs.readdirSync(dutyDir).filter(x => x.endsWith(".yaml"))) {
            // parse yaml
            const content = fs.readFileSync(path.join(dutyDir, f), "utf-8");

            // convert to json
            try {
                const parsed = yaml.load(content) as { zone_id?: number };

                if (parsed && parsed.zone_id) {
                    const mapping = JSON.stringify(parsed, null, 4);
                    const dst = path.join(DIST_PATH, "duty", `${parsed.zone_id}.json`);
                    fs.writeFileSync(dst, mapping, "utf-8");
                    console.log(`${f} copied to ${dst}`);
                } else {
                    console.warn(`warning: skipping file ${f}, missing zone_id`);
                }
            } catch (err) {
                console.error(`error parsing yaml file ${f}: ${(err as Error).message}`);
            }
        }
    } else {
        console.log(`directory ${dutyDir} does not exist, skipping`);
    }
}

build();
