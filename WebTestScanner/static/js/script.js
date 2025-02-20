document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const previewSection = document.querySelector('.preview-section');
    const resultSection = document.querySelector('.result-section');
    const resultJson = document.getElementById('resultJson');
    const loading = document.getElementById('loading');

    // Preview image when selected
    imageInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.src = e.target.result;
                previewSection.style.display = 'block';
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Handle form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData();
        const imageFile = imageInput.files[0];

        if (!imageFile) {
            alert('Please select an image first');
            return;
        }

        formData.append('image', imageFile);

        try {
            loading.style.display = 'block';
            resultSection.style.display = 'none';

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Display the results
            resultJson.textContent = JSON.stringify(data, null, 2);
            resultSection.style.display = 'block';
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            loading.style.display = 'none';
        }
    });
});
