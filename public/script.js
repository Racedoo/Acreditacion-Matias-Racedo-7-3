document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const tipo_problema = document.getElementById('tipo-problema').value.trim();
    const nivel_urgencia = document.getElementById('nivel-urgencia').value.trim();
    const problema = document.getElementById('problema').value.trim();
    
    // Validación previa
    if (!nombre || !tipo_problema || !nivel_urgencia || !problema) {
        alert('Por favor, completá todos los campos.');
        return;
    }
    
    const datos = { nombre, tipo_problema, nivel_urgencia, problema };

    try {
        const respuesta = await fetch('/api/consulta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();
        if (respuesta.ok) {
            alert('¡Registro exitoso!');
        } else {
            alert(resultado.error || 'Error al registrar');
        }
    } catch (error) {
        alert('Error de conexión con el servidor');
        console.log(error);
    }

});