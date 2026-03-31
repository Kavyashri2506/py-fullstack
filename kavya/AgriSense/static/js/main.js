document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recommendation-form');
    const dashboard = document.getElementById('advanced-dashboard');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. UI Loading State
        const originalText = submitBtn.innerText;
        submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Running Hybrid Analysis...';
        submitBtn.disabled = true;
        dashboard.classList.add('hidden'); // Hide old results

        // 2. Gather inputs
        const data = {
            location: document.getElementById('location').value,
            soilType: document.getElementById('soil').value,
            temperature: document.getElementById('temp').value,
            rainfall: document.getElementById('rain').value,
            humidity: document.getElementById('humidity').value,
            ph: document.getElementById('ph').value,
            nitrogen: document.getElementById('nitrogen').value,
            phosphorus: document.getElementById('phosphorus').value,
            potassium: document.getElementById('potassium').value
        };

        try {
            // 3. Fetch from Python Backend
            const response = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Fake delay for realistic ML processing feel
            setTimeout(() => {
                renderDashboard(result);
                
                // Show dashboard & Reset Button
                dashboard.classList.remove('hidden');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Scroll down to dashboard
                dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 1200);

        } catch (error) {
            console.error('Error fetching recommendation:', error);
            submitBtn.innerHTML = 'Error! Check Backend Connection.';
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 3000);
        }
    });

    // --- Render Functions ---

    function renderDashboard(data) {
        renderTopCrops(data.top_crops);
        renderAlerts(data.alerts);
        renderSeasonal(data.seasonal_plan);
        renderRotation(data.rotation_advice);
    }

    function renderTopCrops(crops) {
        const container = document.getElementById('crop-ranks');
        container.innerHTML = '';
        
        crops.forEach((crop, idx) => {
            // Give a slight delay to the bar animation
            const html = `
                <div class="crop-rank-item">
                    <div class="crop-rank-header">
                        <span>${crop.name}</span>
                        <span>${crop.score}% Match</span>
                    </div>
                    <div class="crop-bar-bg">
                        <div class="crop-bar-fill" style="width: 0%; transition-delay: ${idx * 0.2}s"></div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
            
            // Trigger animation next frame
            setTimeout(() => {
                container.lastElementChild.querySelector('.crop-bar-fill').style.width = crop.score + '%';
            }, 50);
        });
    }

    function renderAlerts(alerts) {
        const container = document.getElementById('alert-box');
        container.innerHTML = '';
        
        alerts.forEach(alert => {
            // Pick an icon based on type
            let icon = 'ph-info';
            if(alert.type === 'warning') icon = 'ph-warning-circle';
            if(alert.type === 'danger') icon = 'ph-warning-octagon';
            if(alert.type === 'success') icon = 'ph-check-circle';
            
            const html = `
                <div class="alert-item ${alert.type}">
                    <i class="ph ${icon}"></i>
                    <span>${alert.msg}</span>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    }

    function renderSeasonal(plan) {
        document.getElementById('summer-crops').innerHTML = plan.summer.map(c => `<li>${c}</li>`).join('');
        document.getElementById('kharif-crops').innerHTML = plan.kharif.map(c => `<li>${c}</li>`).join('');
        document.getElementById('rabi-crops').innerHTML = plan.rabi.map(c => `<li>${c}</li>`).join('');
    }

    function renderRotation(advice) {
        document.getElementById('rotation-text').innerText = advice;
    }

    // Scroll smoothing
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});
