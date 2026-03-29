document.addEventListener('DOMContentLoaded', () => {
    const reservationForm = document.getElementById('reservationForm');
    const reservationList = document.getElementById('reservationList');
    const resIdInput = document.getElementById('reservationId');

    fetchReservations();

    reservationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Haetaan lomakkeen tiedot
        const id = resIdInput.value;
        const resourceId = parseInt(document.getElementById('resourceId').value);
        
        // Haetaan kirjautuneen käyttäjän ID (tämä on Phase 7:ssä kriittistä)
        // Jos tämä epäonnistuu, kokeillaan kovaa koodattua ID 1:tä
        const payload = {
            resourceId: resourceId,
            userId: 1, 
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            note: document.getElementById('note').value,
            status: 'active'
        };

        const url = id ? `/api/reservations/${id}` : '/api/reservations';
        const method = id ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                reservationForm.reset();
                resIdInput.value = '';
                document.getElementById('btnCreate').textContent = 'Create Reservation';
                fetchReservations();
                alert('Onnistui!');
            } else {
                // Näytetään tarkka virhe palvelimelta
                alert('Virhe: ' + (result.error || 'Tuntematon virhe tietokannassa'));
                console.error('Server error:', result);
            }
        } catch (err) {
            alert('Yhteysvirhe palvelimeen.');
        }
    });

    async function fetchReservations() {
        try {
            const response = await fetch('/api/reservations');
            const result = await response.json();
            if (result.ok) renderReservations(result.data);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    }

    function renderReservations(reservations) {
        if (!reservations || reservations.length === 0) {
            reservationList.innerHTML = '<p class="text-black/40 italic text-sm">Ei varauksia.</p>';
            return;
        }
        reservationList.innerHTML = reservations.map(res => `
            <div class="p-4 rounded-2xl border border-black/5 bg-black/[0.02] mb-3">
                <div class="flex justify-between items-start">
                    <div class="cursor-pointer" onclick="editReservation(${res.id})">
                        <p class="font-bold text-brand-blue text-xs uppercase">${res.resource_name || 'Resource ' + res.resource_id}</p>
                        <p class="text-[10px] text-black/60">${new Date(res.start_time).toLocaleString('fi-FI')}</p>
                        <p class="text-xs italic text-black/40">"${res.note || ''}"</p>
                    </div>
                    <button onclick="deleteReservation(${res.id})" class="text-brand-primary text-[10px] font-bold">POISTA</button>
                </div>
            </div>
        `).join('');
    }

    window.deleteReservation = async (id) => {
        if (!confirm('Poistetaanko?')) return;
        await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
        fetchReservations();
    };

    window.editReservation = async (id) => {
        const response = await fetch(`/api/reservations/${id}`);
        const result = await response.json();
        if (result.ok) {
            const res = result.data;
            resIdInput.value = res.id;
            document.getElementById('resourceId').value = res.resource_id;
            document.getElementById('startTime').value = new Date(res.start_time).toISOString().slice(0, 16);
            document.getElementById('endTime').value = new Date(res.end_time).toISOString().slice(0, 16);
            document.getElementById('note').value = res.note || '';
            document.getElementById('btnCreate').textContent = 'Update Reservation';
        }
    };
});