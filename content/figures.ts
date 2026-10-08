/**
 * Data behind the recreated and original figures on the deep pages (IMPLEMENTATION_PLAN §4
 * Session 4; DESIGN §3.5). Plotted values are facts, so they live here with the table and page
 * they were read from, and the figure components render them without typing a number. The IoU
 * tables are the thesis's own results (Paige's experiment output), copied digit for digit; the
 * diagrams are original drawings of procedures the sources describe in prose, never crops of
 * a source page.
 */
import type { Diagram, IouTable } from "@/lib/content/schema";

const THESIS = "_source/thesis/honours-thesis-2022.pdf";
const ICAMES_DECK = "_source/capstone/icames-2022-presentation.pdf";
const FINAL_DECK = "_source/capstone/final-presentation-2022.pdf";

const THRESHOLDS = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95];

export const iouTables = [
  {
    id: "iou-resnet34",
    model: "ResNet-34",
    caption:
      "Average IoU between each CAM's thresholded prediction mask and the watermark's ground-truth mask, for ResNet-34, at each threshold. Replotted from the thesis's Table 4.6.",
    table: "Table 4.6",
    cite: "thesis p. 31 (PDF p. 38); identical to Table 4.1, p. 24",
    thresholds: THRESHOLDS,
    series: [
      {
        method: "Grad-CAM",
        values: [0.079, 0.094, 0.115, 0.146, 0.187, 0.235, 0.286, 0.321, 0.292, 0.136],
      },
      {
        method: "Eigen-CAM",
        values: [0.125, 0.15, 0.187, 0.227, 0.265, 0.304, 0.338, 0.328, 0.236, 0.075],
      },
      {
        method: "Grad-CAM++",
        values: [0.091, 0.11, 0.137, 0.176, 0.222, 0.271, 0.318, 0.34, 0.274, 0.091],
      },
      {
        method: "Layer-CAM",
        values: [0.091, 0.109, 0.136, 0.175, 0.222, 0.271, 0.318, 0.341, 0.277, 0.095],
      },
      {
        method: "FullGrad",
        values: [0.075, 0.104, 0.134, 0.17, 0.214, 0.286, 0.378, 0.489, 0.53, 0.384],
      },
    ],
    source: THESIS,
  },
  {
    id: "iou-vgg16",
    model: "VGG-16",
    caption:
      "The same scoring for VGG-16, trained on the same watermarked images. Replotted from the thesis's Table 4.7.",
    table: "Table 4.7",
    cite: "thesis p. 31 (PDF p. 38); identical to Table 4.5, p. 30",
    thresholds: THRESHOLDS,
    series: [
      { method: "Grad-CAM", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      {
        method: "Eigen-CAM",
        values: [0.115, 0.121, 0.126, 0.132, 0.139, 0.148, 0.158, 0.164, 0.152, 0.068],
      },
      {
        method: "Grad-CAM++",
        values: [0.079, 0.085, 0.088, 0.088, 0.088, 0.088, 0.085, 0.076, 0.061, 0.034],
      },
      {
        method: "Layer-CAM",
        values: [0.132, 0.147, 0.164, 0.18, 0.192, 0.198, 0.186, 0.148, 0.105, 0.0578],
      },
      {
        method: "FullGrad",
        values: [0.411, 0.475, 0.535, 0.56, 0.553, 0.505, 0.418, 0.306, 0.195, 0.0731],
      },
    ],
    source: THESIS,
  },
] as const satisfies readonly IouTable[];

export const diagrams = [
  {
    id: "thesis-procedure",
    caption:
      "How ground truth was induced, so that an explanation method could be scored. Original drawing of the procedure the thesis describes; the thesis's own Figure 3.1 is not reproduced.",
    cite: "thesis §3.2–3.3 and §3.5–3.7 (PDF pp. 21–27)",
    loop: false,
    steps: [
      {
        title: "Start from public chest X-rays",
        detail:
          "Images from the COVID-19 Radiography Database, split into training, validation and test sets. Each experiment takes a pair of the original classes.",
      },
      {
        title: "Reassign every label at random",
        detail:
          "Each image lands in the positive or negative class with equal odds, so nothing in the original image predicts its new label.",
      },
      {
        title: "Watermark the positive class only",
        detail:
          "A text watermark of random size and position is added to every positive image. Its rectangle is saved as a binary mask: the ground truth.",
      },
      {
        title: "Train a classifier from scratch",
        detail:
          "ResNet-34 or VGG-16, randomly initialized. High validation accuracy is only possible by reading the watermark, because nothing else is informative.",
      },
      {
        title: "Explain, threshold, score",
        detail:
          "Each CAM method explains the model's prediction on watermarked test images. The map is binarized at a threshold and compared with the mask by intersection over union.",
      },
    ],
    source: THESIS,
  },
  {
    id: "capstone-fitting-loop",
    caption:
      "The brace-fitting loop the project set out to instrument. Original drawing of the process described in the team's competition deck.",
    cite: "ICAMES deck slides 5–6",
    loop: true,
    steps: [
      {
        title: "X-ray and body measurements",
        detail: "The starting data for a new brace, taken without a brace on.",
      },
      {
        title: "Brace made by hand",
        detail:
          "Carved from those measurements, or generated algorithmically and then trimmed at a first fitting.",
      },
      {
        title: "X-ray with the brace on",
        detail: "The only check of how the brace is actually affecting the spine.",
      },
      {
        title: "Adjustments by judgement",
        detail:
          "No instrument measures the pressure the brace applies, so each adjustment rests on experience and the patient's report, and the loop repeats about yearly.",
      },
    ],
    source: ICAMES_DECK,
  },
  {
    id: "capstone-pipeline",
    caption:
      "The pressure-sensing system as built. Original drawing of the architecture in the team's decks; the decks themselves are not published here.",
    cite: "ICAMES deck slides 8–11; final deck slides 11, 22–26",
    loop: false,
    steps: [
      {
        title: "Sensing garment",
        detail:
          "A shirt carrying an array of force sensors, worn under the brace so each sensor sits between torso and brace.",
      },
      {
        title: "Microcontroller firmware",
        detail:
          "Reads every sensor repeatedly and averages the readings to suppress noise, then sends the digitized values to a computer over USB.",
      },
      {
        title: "Desktop application",
        detail:
          "Converts readings to pressure and paints them, live, as a heatmap on a three-dimensional torso model; a capture is saved as a spreadsheet file for design tools.",
      },
      {
        title: "Orthotist",
        detail:
          "Reads where the brace presses hardest and adjusts the fit from measurements rather than guesswork.",
      },
    ],
    source: FINAL_DECK,
  },
] as const satisfies readonly Diagram[];
