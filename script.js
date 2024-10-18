// وظيفة لتحويل الأرقام العربية إلى الأرقام الإنجليزية
function convertArabicNumbers(input) {
    var arabicNumbers = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    var englishNumbers = ['0','1','2','3','4','5','6','7','8','9'];
    var output = input;
    for (var i = 0; i < arabicNumbers.length; i++) {
        var regex = new RegExp(arabicNumbers[i], 'g');
        output = output.replace(regex, englishNumbers[i]);
    }
    return output;
}

// وظيفة لتنسيق الأرقام بإضافة فاصلة كل ثلاثة أرقام
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// وظيفة لإزالة الفواصل من الأرقام
function unformatNumber(num) {
    return num.replace(/,/g, '');
}

// وظيفة لمزامنة حقل النص والمنزلق
function syncInputs(textInput, rangeInput, isDecimal) {
    // حدث إدخال النص
    textInput.addEventListener('input', function(e) {
        var value = convertArabicNumbers(this.value);
        value = value.replace(/[^\d.]/g, '');

        if (!isNaN(value) && value !== '') {
            if (isDecimal) {
                this.value = value;
            } else {
                this.value = formatNumber(value);
            }
            rangeInput.value = parseFloat(unformatNumber(value)) || rangeInput.min;
        } else {
            this.value = '';
            rangeInput.value = rangeInput.min;
        }
    });

    // حدث تغيير المنزلق
    rangeInput.addEventListener('input', function(e) {
        var value = this.value;
        if (isDecimal) {
            textInput.value = value;
        } else {
            textInput.value = formatNumber(value);
        }
    });
}

// تهيئة المدخلات
window.onload = function() {
    // المدخلات الأساسية
    var interestRate = document.getElementById('interestRate');
    var interestRateSlider = document.getElementById('interestRateSlider');
    var housePrice = document.getElementById('housePrice');
    var housePriceSlider = document.getElementById('housePriceSlider');
    var years = document.getElementById('years');
    var yearsSlider = document.getElementById('yearsSlider');
    var downPayment = document.getElementById('downPayment');
    var downPaymentSlider = document.getElementById('downPaymentSlider');

    // المدخلات المتقدمة
    var otherObligations = document.getElementById('otherObligations');
    var otherObligationsSlider = document.getElementById('otherObligationsSlider');

    // مزامنة المدخلات
    syncInputs(interestRate, interestRateSlider, true);
    syncInputs(housePrice, housePriceSlider, false);
    syncInputs(years, yearsSlider, false);
    syncInputs(downPayment, downPaymentSlider, false);

    if (otherObligations && otherObligationsSlider) {
        syncInputs(otherObligations, otherObligationsSlider, false);
    }
}

// وظيفة إظهار القسم الأساسي
function showBasic() {
    document.getElementById('advancedSection').style.display = 'none';
    document.getElementById('basicButton').classList.add('active');
    document.getElementById('advancedButton').classList.remove('active');
}

// وظيفة إظهار القسم المتقدم
function showAdvanced() {
    document.getElementById('advancedSection').style.display = 'block';
    document.getElementById('basicButton').classList.remove('active');
    document.getElementById('advancedButton').classList.add('active');
}

function calculateMortgage() {
    var interestRateInput = document.getElementById('interestRate').value;
    var housePriceInput = document.getElementById('housePrice').value;
    var yearsInput = document.getElementById('years').value;
    var downPaymentInput = document.getElementById('downPayment').value;
    var otherObligationsInput = document.getElementById('otherObligations') ? document.getElementById('otherObligations').value : null;

    // تحويل الأرقام العربية وإزالة الفواصل
    var interestRate = parseFloat(convertArabicNumbers(interestRateInput));
    var housePrice = parseFloat(unformatNumber(convertArabicNumbers(housePriceInput)));
    var years = parseInt(convertArabicNumbers(yearsInput));
    var downPayment = downPaymentInput ? parseFloat(unformatNumber(convertArabicNumbers(downPaymentInput))) : null;
    var otherObligations = otherObligationsInput ? parseFloat(unformatNumber(convertArabicNumbers(otherObligationsInput))) : 0;

    // التحقق من صحة الإدخالات وتحديد الحقول الناقصة
    var missingFields = [];
    if (isNaN(interestRate) || interestRateInput.trim() === '') {
        missingFields.push('معدل الفائدة');
    }
    if (isNaN(housePrice) || housePriceInput.trim() === '') {
        missingFields.push('سعر المنزل');
    }
    if (isNaN(years) || yearsInput.trim() === '') {
        missingFields.push('مدة الرهن');
    }

    if (missingFields.length > 0) {
        var message = 'يرجى إدخال قيمة صحيحة في الحقول التالية: ' + missingFields.join(', ');
        document.getElementById('result').innerHTML = message;
        return;
    }

    // التحقق من أن مدة الرهن لا تتجاوز 30 سنة
    if (years > 30) {
        document.getElementById('result').innerHTML = 'مدة الرهن لا يمكن أن تتجاوز 30 سنة.';
        return;
    }

    // إذا لم يتم إدخال دفعة مقدمة، اعتبارها 10٪ من سعر المنزل
    if (downPayment === null || isNaN(downPayment)) {
        downPayment = housePrice * 0.10;
    }

    // حساب مبلغ القرض الرئيسي
    var principal = housePrice - downPayment;

    // التحقق من أن مبلغ القرض ليس سلبياً
    if (principal <= 0) {
        document.getElementById('result').innerHTML = 'الدفعة المقدمة يجب أن تكون أقل من سعر المنزل.';
        return;
    }

    // حساب معدل الفائدة الشهري
    var monthlyInterestRate = interestRate / 100 / 12;

    // إجمالي عدد الدفعات (بالأشهر)
    var numberOfPayments = years * 12;

    // حساب الدفعة الشهرية باستخدام الصيغة القياسية
    var monthlyPayment = principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    // إضافة الالتزامات الشهرية الأخرى إذا تم إدخالها وفي الوضع المتقدم
    if (document.getElementById('advancedSection').style.display === 'block' && !isNaN(otherObligations) && otherObligations > 0) {
        monthlyPayment += otherObligations;
    }

    // تنسيق النتيجة إلى منزلتين عشريتين وإضافة الفواصل
    monthlyPayment = formatNumber(monthlyPayment.toFixed(2));

    // عرض النتيجة
    document.getElementById('result').innerHTML = 'دفعتك الشهرية: ' + monthlyPayment + ' ريال';
}
