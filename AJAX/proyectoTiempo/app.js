$(document).ready(function () {
    const apiKey = 'a672d1f7cb24f66f19be868475341f1e';
    let units = 'metric';
    const lang = 'es';
    const history = [];
    const suggestions = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao"];

    // Buscar clima por ciudad
    $('#weather-form').on('submit', function (e) {
        e.preventDefault();
        const city = $('#city').val();
        if (city) {
            addToHistory(city);
            getWeather(city);
            getForecast(city);
        }
    });

    // Autocompletado
    $('#city').on('input', function () {
        const input = $(this).val().toLowerCase();
        if (input) {
            const filtered = suggestions.filter(city => city.toLowerCase().startsWith(input));
            $('#suggestions').html(filtered.map(city => `<li>${city}</li>`).join('')).show();
        } else {
            $('#suggestions').hide();
        }
    });

    // Selección en sugerencias
    $(document).on('click', '#suggestions li', function () {
        const selectedCity = $(this).text();
        $('#city').val(selectedCity);
        $('#suggestions').hide();
        $('#weather-form').submit();
    });

    // Cambiar entre °C y °F
    $('#unit-toggle').on('change', function () {
        units = $(this).is(':checked') ? 'imperial' : 'metric';
        const lastCity = history[history.length - 1];
        if (lastCity) {
            getWeather(lastCity);
            getForecast(lastCity);
        }
    });

    // Geolocalización
    $('#current-location').on('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
                getForecastByCoords(latitude, longitude);
            });
        } else {
            alert('Geolocalización no soportada.');
        }
    });

    // Cambiar tema
    $('#theme-toggle').on('click', function () {
        $('body').toggleClass('dark-theme light-theme');
    });

    function addToHistory(city) {
        if (!history.includes(city)) {
            history.push(city);
            $('#history').append(`<li>${city}</li>`);
        }
    }

    // Obtener datos de clima por ciudad
    function getWeather(city) {
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&lang=${lang}&appid=${apiKey}`,
            method: 'GET',
            success: function (data) {
                const weatherHtml = `
                    <h3>${data.name}, ${data.sys.country}</h3>
                    <p><strong>Temperatura:</strong> ${data.main.temp}°</p>
                    <p><strong>Humedad:</strong> ${data.main.humidity}%</p>
                    <p><strong>Viento:</strong> ${data.wind.speed} ${units === 'metric' ? 'm/s' : 'mph'}</p>
                    <p><strong>Clima:</strong> ${data.weather[0].description}</p>
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Icono del clima">
                `;
                $('.weather-info').html(weatherHtml);
            },
            error: function () {
                alert('No se pudo obtener el clima. Verifica el nombre de la ciudad.');
            }
        });
    }

    // Pronóstico por ciudad
    function getForecast(city) {
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&lang=${lang}&appid=${apiKey}`,
            method: 'GET',
            success: function (data) {
                let forecastHtml = '';
                data.list.forEach((item, index) => {
                    if (index % 8 === 0) { // Cada 8 intervalos (24 horas)
                        forecastHtml += `
                            <div class="forecast-card">
                                <p><strong>${item.dt_txt.split(' ')[0]}</strong></p>
                                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Icono del clima">
                                <p>${item.weather[0].description}</p>
                                <p><strong>Temp:</strong> ${item.main.temp}°</p>
                            </div>
                        `;
                    }
                });
                $('.forecast-info').html(forecastHtml);
            },
            error: function () {
                alert('No se pudo obtener el pronóstico.');
            }
        });
    }
});
