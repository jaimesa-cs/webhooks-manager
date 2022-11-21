import BaseWebhook from "./base";
import { getEntry } from "../utils/contentstack-cd";
import pptxgen from "pptxgenjs";
import { saveAsset } from "../utils/contentstack-cm";
import useEnvironment from "../utils/environment";

const env = useEnvironment();

export default class GeneratePPTPreview extends BaseWebhook {
  id: string = "generate-ppt-preview";
  description: string = "Generates a ppt and preview";
  constructor() {
    super();
  }

  generatePPT(entry: any) {
    let pres = new pptxgen();

    // 2. Add a Slide to the presentation
    let slide = pres.addSlide();

    // 3. Add 1+ objects (Tables, Shapes, etc.) to the Slide
    slide.addText(entry.title, {
      x: 1.5,
      y: 1.5,
      color: "363636",
      fill: { color: "F1F1F1" },
      align: pres.AlignH.center,
    });
    slide.addNotes(JSON.stringify(entry));

    // 4. Save the Presentation
    const filename = `${env.DEFAULT_FILE_LOCATION}/${entry.uid}.pptx`;
    pres.writeFile({ fileName: filename });
    return filename;
  }

  async execute() {
    try {
      //1. Load the full JSON payload
      const payload = this.getPayload<any>();
      const includeHeader = this.getHeader("include");
      const entryUid = payload.data.entry.uid;
      const contentTypeUid = payload.data.content_type.uid;

      const includes: string[] = includeHeader && includeHeader !== "" ? includeHeader.split(",") : []; // ["metadata.metadata", "metadata.business_priorities"];
      // console.log(includes);
      const entry = await getEntry(contentTypeUid, entryUid, payload.data.environment.name, includes);

      //2. Generate a pptx file
      const filename = this.generatePPT(entry);

      //3. Save it back as an asset in Contentstack
      const response = await saveAsset(filename, contentTypeUid, entryUid);

      //4. Generate PDF

      //5. Return the asset url
      this.success();
    } catch (e) {
      console.log("Something went wrong!");
      //   console.log(e);
      this.error(e);
    }
  }
}
