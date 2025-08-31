/**
 * © 2025 N&M_AI_ART. All Rights Reserved.
 */
export const locales = {
  vi: {
    // App.tsx
    title: "AI Fashion Studio",
    tagline: "Thử trang phục ảo. Phong cách tức thì.",
    characterImageCaption: "Ảnh người mẫu",
    propImageCaption: "Ảnh Trang phục / Vật phẩm",
    backgroundImageCaption: "Nguồn cảm hứng nền",
    generateButton: "Tạo ảnh",
    resetButton: "Chọn lại ảnh",
    newButton: "Tạo ảnh mới",
    downloadButton: "Tải xuống",
    generatingState: "Đang tạo hình ảnh...",
    resultState: "Tác phẩm của bạn",
    cameraAngleLabel: "Góc Chụp",
    cameraAngleOptions: {
      full_body: "Toàn thân",
      half_body: "Bán thân",
      close_up: "Cận cảnh",
      side_view: "Góc nghiêng",
      from_behind: "Chụp từ sau lưng",
    },

    // PolaroidCard.tsx
    placeholderText: "Tải ảnh lên",
    downloadAriaLabel: "Tải xuống ảnh",
    
    // Footer.tsx
    copyright: "© 2025 N&M_AI_ART. All Rights Reserved.",
    termsOfService: "Điều khoản Dịch vụ",
    poweredBy: "Vận hành bởi Gemini 2.5 Flash Image Preview",
    createdBy: "Sáng tạo bởi",
    followMessage: 'Follow <a href="https://www.facebook.com/nghiainterior/" target="_blank" rel="noopener noreferrer" class="font-bold text-[#010000] hover:underline">N&M_AI_ART</a> để có nhiều trải nhiệm và ứng dụng với AI mới nhất.',
    remixIdeasTitle: "Ý tưởng sáng tạo khác...",
    remixIdeas: [
      "thử trang phục trên bối cảnh đường phố.",
      "thay đổi thành phong cách lookbook tạp chí.",
      "thêm phụ kiện hợp thời trang (túi xách, kính râm).",
      "biến tấu trang phục (vd: áo thun thành váy).",
      "tạo phong cách thời trang avant-garde.",
      "kết hợp trang phục với một phong cách khác.",
    ],
    openInAIStudio: "Mở trong AI Studio",
    chatWithGemini: "Trò chuyện với Gemini",

    // geminiService.ts
    geminiPrompt: "Phân tích 3 ảnh đầu vào: [ảnh 1: người mẫu], [ảnh 2: trang phục/vật phẩm], [ảnh 3: nguồn cảm hứng nền]. Mục tiêu: Tạo một bức ảnh thời trang chuyên nghiệp, chất lượng cao, siêu thực. Bố cục ảnh cuối cùng phải là một góc chụp '[CAMERA_ANGLE_PLACEHOLDER]'. Hướng dẫn: Giữ lại khuôn mặt và đặc điểm chính của người mẫu từ ảnh 1. Điều chỉnh tinh tế tư thế của người mẫu để chuyên nghiệp và tự nhiên, phù hợp với góc máy đã chọn. Cho người mẫu mặc hoặc cầm vật phẩm từ ảnh 2 một cách chân thực. Không sử dụng trực tiếp ảnh 3, hãy coi nó là nguồn cảm hứng về phong cách. Tạo một bối cảnh mới, phù hợp và được làm mờ một cách nghệ thuật (hiệu ứng bokeh/xóa phông) để làm nổi bật người mẫu và sản phẩm. Đảm bảo ánh sáng và bóng đổ nhất quán và chân thực. Chỉ xuất ra hình ảnh cuối cùng.",
    geminiFallbackPrompt: "Tạo một bức ảnh chụp '[CAMERA_ANGLE_PLACEHOLDER]' của người mẫu (từ ảnh 1) đang mặc/cầm (ảnh 2) trong một bối cảnh được lấy cảm hứng từ (ảnh 3) với hiệu ứng xóa phông. Giữ lại khuôn mặt của người mẫu.",
    invalidDataUrlError: "URL dữ liệu hình ảnh không hợp lệ. Vui lòng sử dụng định dạng 'data:image/...;base64,...'",
    apiReturnsTextError: 'AI đã trả về văn bản thay vì hình ảnh: ',
    noResponseError: "Không có phản hồi.",
    connectionError: "Không thể kết nối tới Gemini API sau nhiều lần thử.",
    fallbackFailedError: "AI không thể xử lý yêu cầu, ngay cả với phương án dự phòng. Lỗi: ",
    unrecoverableError: "Không thể tạo hình ảnh. Chi tiết lỗi: "
  },
  en: {
    // App.tsx
    title: "AI Fashion Studio",
    tagline: "Virtual Try-On. Instant Style.",
    characterImageCaption: "Model Photo",
    propImageCaption: "Clothing / Item Photo",
    backgroundImageCaption: "Background Inspiration",
    generateButton: "Generate",
    resetButton: "Reset Images",
    newButton: "Create New",
    downloadButton: "Download",
    generatingState: "Generating image...",
    resultState: "Your Creation",
    cameraAngleLabel: "Camera Angle",
    cameraAngleOptions: {
      full_body: "Full Body",
      half_body: "Half Body",
      close_up: "Close-up",
      side_view: "Side View",
      from_behind: "From Behind",
    },

    // PolaroidCard.tsx
    placeholderText: "Upload Image",
    downloadAriaLabel: "Download image",

    // Footer.tsx
    copyright: "© 2025 N&M_AI_ART. All Rights Reserved.",
    termsOfService: "Terms of Service",
    poweredBy: "Powered by Gemini 2.5 Flash Image Preview",
    createdBy: "Created by",
    followMessage: 'Follow <a href="https://www.facebook.com/nghiainterior/" target="_blank" rel="noopener noreferrer" class="font-bold text-[#010000] hover:underline">N&M_AI_ART</a> for more experiences and the latest AI applications.',
    remixIdeasTitle: "More creative ideas...",
    remixIdeas: [
      "try the outfit in a street style scene.",
      "change to a magazine lookbook style.",
      "add trendy accessories (handbag, sunglasses).",
      "transform the clothing (e.g., t-shirt into a dress).",
      "create an avant-garde fashion style.",
      "mix the outfit with a different fashion genre.",
    ],
    openInAIStudio: "Open in AI Studio",
    chatWithGemini: "Chat with Gemini",
    
    // geminiService.ts
    geminiPrompt: "Analyze 3 input images: [image 1: model], [image 2: clothing/item], [image 3: background style inspiration]. Goal: Generate a single, high-quality, photorealistic, professional fashion photograph. The final composition must be a '[CAMERA_ANGLE_PLACEHOLDER]' shot. Instructions: Retain the model's face and key features from image 1. Subtly adjust the model's pose to be professional and natural for the specified camera angle. Have the model realistically wear or hold the item from image 2. Instead of using image 3 directly, treat it as a style reference. Create a new, complementary background that is artistically blurred (bokeh/shallow depth of field) to ensure the model and item are the main focus. Ensure lighting and shadows are consistent and realistic. Output only the final image.",
    geminiFallbackPrompt: "Create a '[CAMERA_ANGLE_PLACEHOLDER]' photo of the model (from image 1) wearing/holding the item (from image 2) in a background inspired by image 3 with a bokeh effect. Preserve the model's face.",
    invalidDataUrlError: "Invalid image data URL. Please use the 'data:image/...;base64,...' format.",
    apiReturnsTextError: "The AI returned text instead of an image: ",
    noResponseError: "No response.",
    connectionError: "Could not connect to the Gemini API after multiple attempts.",
    fallbackFailedError: "The AI could not process the request, even with the fallback. Error: ",
    unrecoverableError: "Could not generate the image. Error details: "
  },
};

export type Language = keyof typeof locales;