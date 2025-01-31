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

// تهيئة المدخلات والمنزلقات
window.onload = function() {
    // تعريف المدخلات
    var interestRate = document.getElementById('interestRate');
    var interestRateSlider = document.getElementById('interestRateSlider');

    var housePrice = document.getElementById('housePrice');
    var housePriceSlider = document.getElementById('housePriceSlider');

    var years = document.getElementById('years');
    var yearsSlider = document.getElementById('yearsSlider');

    var downPayment = document.getElementById('downPayment');
    var downPaymentSlider = document.getElementById('downPaymentSlider');

    // تزامن المنزلقات مع حقول النص
    synchronizeInputAndSlider(interestRate, interestRateSlider, formatNumber, parseFloat);
    synchronizeInputAndSlider(housePrice, housePriceSlider, formatNumber, parseFloat);
    synchronizeInputAndSlider(years, yearsSlider, formatNumber, parseInt);
    synchronizeInputAndSlider(downPayment, downPaymentSlider, formatNumber, parseFloat);

    // إجراء الحساب الأولي
    validateAndCalculate();
}

// وظيفة لتزامن حقل النص مع المنزلق
function synchronizeInputAndSlider(textInput, sliderInput, formatter, parser) {
    // عند تغيير المنزلق
    sliderInput.addEventListener('input', function() {
        textInput.value = formatter(this.value);
        validateAndCalculate();
    });

    // عند تغيير حقل النص
    textInput.addEventListener('input', function() {
        var value = unformatNumber(convertArabicNumbers(this.value));
        if (value === '' || isNaN(parser(value))) {
            sliderInput.value = sliderInput.min;
        } else {
            sliderInput.value = value;
        }
        validateAndCalculate();
    });
}

// دالة للتحقق من صحة الإدخالات وتنفيذ الحساب إذا كانت الإدخالات صحيحة
function validateAndCalculate() {
    var interestRateInput = document.getElementById('interestRate').value;
    var housePriceInput = document.getElementById('housePrice').value;
    var yearsInput = document.getElementById('years').value;

    var interestRate = parseFloat(convertArabicNumbers(interestRateInput));
    var housePrice = parseFloat(unformatNumber(convertArabicNumbers(housePriceInput)));
    var years = parseInt(convertArabicNumbers(yearsInput));

    // التحقق من أن الإدخالات المطلوبة ليست فارغة وصحيحة
    if (
        !isNaN(interestRate) && interestRateInput.trim() !== '' &&
        !isNaN(housePrice) && housePriceInput.trim() !== '' &&
        !isNaN(years) && yearsInput.trim() !== ''
    ) {
        // تنفيذ الحساب
        calculateMortgage();
    } else {
        // مسح النتيجة إذا كانت الإدخالات غير مكتملة أو غير صحيحة
        document.getElementById('result').innerHTML = '';
    }
}

// وظيفة لحساب الدفعة الشهرية للرهن العقاري
function calculateMortgage() {
    var interestRateInput = document.getElementById('interestRate').value;
    var housePriceInput = document.getElementById('housePrice').value;
    var yearsInput = document.getElementById('years').value;
    var downPaymentInput = document.getElementById('downPayment').value;

    // تحويل الأرقام العربية وإزالة الفواصل
    var interestRate = parseFloat(convertArabicNumbers(interestRateInput));
    var housePrice = parseFloat(unformatNumber(convertArabicNumbers(housePriceInput)));
    var years = parseInt(convertArabicNumbers(yearsInput));
    var downPayment = downPaymentInput ? parseFloat(unformatNumber(convertArabicNumbers(downPaymentInput))) : 0;

    // التحقق من أن المدخلات أكبر من الصفر
    if (interestRate < 0 || housePrice <= 0 || years <= 0 || downPayment < 0) {
        document.getElementById('result').innerHTML = 'يرجى إدخال قيم صحيحة.';
        return;
    }

    // التحقق من أن الدفعة المقدمة أقل من سعر المنزل
    if (downPayment >= housePrice) {
        document.getElementById('result').innerHTML = 'الدفعة المقدمة يجب أن تكون أقل من سعر المنزل.';
        return;
    }

    // التحقق من أن مدة الرهن لا تتجاوز 30 سنة
    if (years > 30) {
        document.getElementById('result').innerHTML = 'مدة الرهن لا يمكن أن تتجاوز 30 سنة.';
        return;
    }

    // حساب مبلغ القرض الرئيسي
    var principal = housePrice - downPayment;

    // حساب معدل الفائدة الشهري
    var monthlyInterestRate = interestRate / 100 / 12;

    // إجمالي عدد الدفعات (بالأشهر)
    var numberOfPayments = years * 12;

    var monthlyPayment;

    if (interestRate === 0) {
        // في حالة معدل الفائدة صفر
        monthlyPayment = principal / numberOfPayments;
    } else {
        // حساب الدفعة الشهرية
        var factor = (interestRate / 100 * years) + 1
        monthlyPayment = principal * factor / numberOfPayments;
    }

    // التحقق من أن الدفعة الشهرية رقم صالح
    if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
        document.getElementById('result').innerHTML = 'حدث خطأ في الحساب. يرجى التحقق من القيم المدخلة.';
        return;
    }

    // تنسيق النتيجة
    monthlyPaymentTemp = monthlyPayment;
    monthlyPayment = formatNumber(monthlyPayment.toFixed(2));

    fullInterest = formatNumber((monthlyPaymentTemp * numberOfPayments - principal).toFixed(2));

    // عرض النتيجة
    document.getElementById('result').innerHTML = 'دفعتك الشهرية: ' + monthlyPayment + ' ريال';
    document.getElementById('interest').innerHTML = 'إجمالي فوائد البنك: ' + fullInterest + ' ريال';
}
