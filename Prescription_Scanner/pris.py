from ultralytics import YOLO
import matplotlib.pyplot as plt
import cv2

model = YOLO("best.pt")
# results=model.predict(source="C:\CODDING\GitRepo\MSM\images.jpeg", task="detect", mode="predict")
# plt.imshow(results[0].plot())
# plt.axis('off')
# plt.show()

# Load your image
image_path = "C:\CODDING\GitRepo\MSM\images.jpeg"
image = cv2.imread(image_path)

# Run YOLO detection
results = model(image)

# Loop through detections and crop
for i, (x1, y1, x2, y2) in enumerate(results[0].boxes.xyxy):  # Access bounding box coordinates
    # Convert coordinates to integer
    x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
    
    # Crop the image
    cropped_image = image[y1:y2, x1:x2]
    
    # Save or display the cropped region
    cv2.imwrite(f"cropped_object_{i}.jpg", cropped_image)
    # cv2.imshow(f"Cropped Object {i}", cropped_image)  # Use for display if needed

# Release any open CV windows if displayed
cv2.destroyAllWindows()