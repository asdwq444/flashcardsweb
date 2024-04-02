const folders = {};

document.getElementById('saveDataBtn').addEventListener('click', () => {
    const dataStr = JSON.stringify(folders);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'flashcards_data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

document.getElementById('loadDataInput').addEventListener('change', function() {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const jsonData = JSON.parse(event.target.result);
            Object.assign(folders, jsonData);
            alert('Данные успешно загружены!');
            // Обновление UI или данных, если необходимо
        } catch (e) {
            alert('Ошибка при загрузке файла: ' + e.message);
        }
    };

    const file = this.files[0];
    if (file) {
        fileReader.readAsText(file);
    }
});


document.getElementById('createFolderBtn').addEventListener('click', () => {
    const folderName = prompt('Введите название папки:');
    if (folderName && !folders[folderName]) {
        folders[folderName] = [];
        alert('Папка успешно создана!');
    } else {
        alert('Некорректное название или папка уже существует.');
    }
});

document.getElementById('selectFolderBtn').addEventListener('click', () => {
    updateFolderList(); // Обновляем список папок
    document.getElementById('menu').style.display = 'none';
    document.getElementById('folderSelection').style.display = 'block'; // Показываем выбор папки
});

document.getElementById('openFolderBtn').addEventListener('click', () => {
    const selectedFolder = document.getElementById('folderList').value;
    if (selectedFolder) {
        currentFolder = selectedFolder;
        document.getElementById('folderSelection').style.display = 'none';
        document.getElementById('folderContents').style.display = 'none'; // Скрываем содержимое папки
        document.getElementById('createQuestion').style.display = 'flex'; // Переходим к добавлению вопросов
    } else {
        alert('Пожалуйста, выберите папку.');
    }
});



// Функция для обновления списка папок
function updateFolderList() {
    const folderList = document.getElementById('folderList');
    folderList.innerHTML = '<option value="">Выберите папку</option>'; // Очищаем существующие папки
    Object.keys(folders).forEach(folderName => {
        const option = document.createElement('option');
        option.value = folderName;
        option.textContent = folderName;
        folderList.appendChild(option);
    });
}


document.getElementById('saveQuestionBtn').addEventListener('click', () => {
    const question = document.getElementById('questionInput').value.trim();
    const answer = document.getElementById('answerInput').value.trim();
    const imageFiles = document.getElementById('imageInput').files; // Теперь это массив файлов

    if (question && answer) {
        let newQuestion = { question, answer, images: [], stats: { correct: 0, incorrect: 0 } };

        if (imageFiles.length) {
            let loadedImages = 0;
            Array.from(imageFiles).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    newQuestion.images.push(e.target.result); // Добавляем URL изображения
                    loadedImages++;
                    if (loadedImages === imageFiles.length) { // Проверяем, все ли изображения загружены
                        folders[currentFolder].push(newQuestion);
                        clearInputs();
                        alert('Вопрос с изображениями ответа добавлен.');
                    }
                };
                reader.readAsDataURL(file);
            });
        } else {
            folders[currentFolder].push(newQuestion);
            clearInputs();
            alert('Вопрос добавлен.');
        }
    } else {
        alert('Вопрос и ответ не могут быть пустыми.');
    }
});



function clearInputs() {
    document.getElementById('questionInput').value = '';
    document.getElementById('answerInput').value = '';
    document.getElementById('imageInput').value = ''; // Очистка поля выбора файла
}

document.getElementById('startStudyingBtn').addEventListener('click', () => {
    if (folders[currentFolder] && folders[currentFolder].length > 0) {
        studyCards = folders[currentFolder];
        shuffleCards(studyCards);
        currentCardIndex = 0;
        document.getElementById('createQuestion').style.display = 'none';
        showNextCard();
    } else {
        alert('В этой папке нет вопросов для изучения.');
    }
});

function showNextCard() {
    if (currentCardIndex < studyCards.length) {
        const card = studyCards[currentCardIndex];
        document.getElementById('cardQuestion').textContent = card.question;
        document.getElementById('cardAnswer').innerHTML = card.answer; // Очищаем предыдущий ответ

        // Отображаем изображения в карусели
        const imagesContainer = document.createElement('div');
        imagesContainer.id = 'carouselImagesContainer';
        imagesContainer.className = 'carousel';

        if (card.images && card.images.length) {
            card.images.forEach((imageSrc, index) => {
                const img = document.createElement('img');
                img.src = imageSrc;
                img.className = 'carousel-image';
                img.style.display = index === 0 ? 'block' : 'none'; // Показываем только первое изображение
                imagesContainer.appendChild(img);
            });
        }

        document.getElementById('cardAnswer').appendChild(imagesContainer);

        setupCarousel(); // Функция для инициализации карусели

        document.getElementById('studyMode').style.display = 'flex';
        document.getElementById('showAnswerBtn').style.display = 'inline-block';
        document.getElementById('cardAnswer').style.display = 'none';
        document.querySelectorAll('.responseBtn').forEach(button => button.style.display = 'none');
    } else {
        alert('Вы ответили на все вопросы в этой папке.');
        document.getElementById('studyMode').style.display = 'none';
        document.getElementById('menu').style.display = 'flex';
    }

    
}

function setupCarousel() {
    let currentImageIndex = 0;
    const images = document.querySelectorAll('.carousel-image');
    const totalImages = images.length;

    // Функция для переключения изображений
    function showImage(index) {
        images.forEach((img, idx) => {
            img.style.display = idx === index ? 'block' : 'none';
        });
    }

    // Функция для перехода к следующему изображению
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % totalImages;
        showImage(currentImageIndex);
    }

    // Функция для перехода к предыдущему изображению
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
        showImage(currentImageIndex);
    }

    // Добавление кнопок управления каруселью
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '←';
    prevBtn.addEventListener('click', prevImage);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '→';
    nextBtn.addEventListener('click', nextImage);

    const carousel = document.getElementById('carouselImagesContainer');
    carousel.before(prevBtn);
    carousel.after(nextBtn);
}


document.getElementById('showAnswerBtn').addEventListener('click', () => {
    document.getElementById('cardAnswer').style.display = 'block';
    document.querySelectorAll('.responseBtn').forEach(button => button.style.display = 'inline-block');
    document.getElementById('showAnswerBtn').style.display = 'none';
});

document.getElementById('correctBtn').addEventListener('click', () => {
    studyCards[currentCardIndex].stats.correct++;
    // Затем увеличиваем индекс для перехода к следующему вопросу
    currentCardIndex++;
    showNextCard();
});

document.getElementById('incorrectBtn').addEventListener('click', () => {
    studyCards[currentCardIndex].stats.incorrect++;
    // Затем увеличиваем индекс для перехода к следующему вопросу
    currentCardIndex++;
    showNextCard();
});


function shuffleCards(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

// Переменная для хранения текущей открытой папки
let currentFolder = '';

document.getElementById('selectFolderBtn').addEventListener('click', () => {
    updateFolderList(); // Вызывается при попытке выбрать папку
    showFolderContents(); // Показывает содержимое выбранной папки
});

document.getElementById('deleteFolderBtn').addEventListener('click', () => {
    if (currentFolder && confirm('Вы уверены, что хотите удалить эту папку и все её содержимое?')) {
        delete folders[currentFolder];
        currentFolder = '';
        alert('Папка удалена');
        document.getElementById('folderContents').style.display = 'none';
        document.getElementById('menu').style.display = 'flex';
        // Сохраните изменения в localStorage, если необходимо
    }
});

document.getElementById('backToMenuBtn').addEventListener('click', () => {
    // Скрытие всех несвязанных блоков
    document.getElementById('folderContents').style.display = 'none';
    document.getElementById('folderSelection').style.display = 'none';
    document.getElementById('createQuestion').style.display = 'none';
    document.getElementById('studyMode').style.display = 'none';
    document.getElementById('statistics').style.display = 'none';
    // Показ блока меню
    document.getElementById('menu').style.display = 'flex';
});

document.getElementById('backToMenuBtnFromStatistics').addEventListener('click', () => {
    // Скрытие всех несвязанных блоков
    document.getElementById('folderContents').style.display = 'none';
    document.getElementById('folderSelection').style.display = 'none';
    document.getElementById('createQuestion').style.display = 'none';
    document.getElementById('studyMode').style.display = 'none';
    document.getElementById('statistics').style.display = 'none';
    // Показ блока меню
    document.getElementById('menu').style.display = 'flex';
});

document.getElementById('backToMenuBtn2').addEventListener('click', () => {
    // Скрытие всех несвязанных блоков
    document.getElementById('folderContents').style.display = 'none';
    document.getElementById('folderSelection').style.display = 'none';
    document.getElementById('createQuestion').style.display = 'none';
    document.getElementById('studyMode').style.display = 'none';

    // Показ блока меню
    document.getElementById('menu').style.display = 'flex';
});


function showFolderContents() {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = ''; // Очистка списка перед отображением

    if (folders[currentFolder] && folders[currentFolder].length > 0) {
        folders[currentFolder].forEach((question, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = question.question + ' - ' + question.answer;
            // Добавим кнопку для удаления вопроса
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Удалить вопрос';
            deleteBtn.onclick = function() {
                folders[currentFolder].splice(index, 1);
                showFolderContents(); // Обновляем отображение списка вопросов
                // Сохраните изменения в localStorage, если необходимо
            };
            listItem.appendChild(deleteBtn);
            questionsList.appendChild(listItem);
        });
    } else {
        questionsList.innerHTML = '<li>В этой папке нет вопросов</li>';
    }

    document.getElementById('currentFolderName').textContent = currentFolder;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('folderContents').style.display = 'block';
}

function updateFolderList() {
    const folderList = document.getElementById('folderList');
    // Очищаем существующие опции перед добавлением новых
    folderList.innerHTML = '<option value="">Выберите папку</option>';

    // Проходимся по всем папкам и добавляем их в список
    Object.keys(folders).forEach(folderName => {
        const option = document.createElement('option');
        option.value = folderName;
        option.textContent = folderName;
        folderList.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчик события к кнопке "Статистика"
    document.getElementById('viewStatisticsBtn').addEventListener('click', () => {
        // Получаем выбранное значение папки
        const selectedFolder = document.getElementById('folderList').value;
        
        if (selectedFolder) {
            // Если папка выбрана, показываем статистику
            showStatistics(selectedFolder);
        } else {
            // Если папка не выбрана, выводим сообщение об ошибке
            alert('Пожалуйста, выберите папку для просмотра статистики.');
        }
    });
});

function showStatistics(folderName) {
    // Скрываем все несвязанные элементы
    document.getElementById('menu').style.display = 'none';
    document.getElementById('folderSelection').style.display = 'none';
    document.getElementById('createQuestion').style.display = 'none';
    document.getElementById('studyMode').style.display = 'none';
    document.getElementById('folderContents').style.display = 'none';
    
    // Отображаем статистику
    const statisticsSection = document.getElementById('statistics');
    const statisticsList = document.getElementById('statisticsList');
    statisticsList.innerHTML = ''; // Очищаем текущий список
    
    const folderData = folders[folderName];
    folderData.forEach(question => {
        const li = document.createElement('li');
        li.innerHTML = `${question.question}: <span class="correct">Правильно - ${question.stats.correct}</span>, <span class="incorrect">Неправильно - ${question.stats.incorrect}</span>`;
        statisticsList.appendChild(li);
    });
    
    document.getElementById('statisticsFolderName').textContent = folderName;
    statisticsSection.style.display = 'block';
}


document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчик события к кнопке "Закончить обучение"
    document.getElementById('endStudySessionBtn').addEventListener('click', () => {
        // Скрываем раздел изучения вопросов
        document.getElementById('studyMode').style.display = 'none';
        // Показываем главное меню
        document.getElementById('menu').style.display = 'flex';

        // Очистка состояния изучения, если это необходимо
        // Например, можно сбросить текущий индекс вопроса или очистить выбранные ответы
    });
});
