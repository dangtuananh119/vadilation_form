// Doi tuong vadilator
function Vadilator(options) {

    // La 1 obj co key la selector cua cac input va co gia tri la cac mang chua function test cua tung input
    var selectorRules = {};

    // Xu li khi co loi va khong co loi
    function validate(inputElement, rule) {
        var formGroupElement = inputElement.closest(options.formGroupSelector)
        var errorElement = formGroupElement.querySelector(options.errorSelector)
        // Lay ra cac rule cua selector, rule: ham test
        var rules = selectorRules[rule.selector]

        // Lap qua tung rule va kiem tra neu co loi thi dung viec kiem tra
        for(var i = 0; i < rules.length; i++) {
            switch(inputElement.type){
                case 'checkbox':
                case 'radio':
                    var errorMess = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break   
                default:
                    var errorMess = rules[i](inputElement.value)
            }

            if(errorMess) break
        }

        if(errorMess) {
            errorElement.innerText = errorMess
            formGroupElement.classList.add('invalid')
        }else {
            errorElement.innerText = ''
            formGroupElement.classList.remove('invalid')
        }

        return !errorMess
    }

    // Lay Element cua form can validate
    var formElement = document.querySelector(options.form)
    if(formElement) {
        // Xử lí sự kiện khi submit form
        formElement.onsubmit = (e) => {
            // Ngan hanh vi submit mac dinh cua trinh duyet
            e.preventDefault()

            var isFormValid = true;

            // Thực hiện lặp qua từng rule và validate luôn
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule) // false neu co loi
                if(!isValid) {
                    isFormValid = false
                }
            })
            if(isFormValid) {
                // Trường hợp submit với JS
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="'+ input.name +'"]:checked').value
                                break
                            case 'checkbox': 
                                if(!input.matches(':checked')) return values
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    } , {})
                    options.onSubmit(formValues)
                }
                // Submit với hành vi mặc định
                else {
                    formElement.submit()
                }
            }
        }
        
        // Xử lí lặp qua mỗi rule và lắng nghe sự kiện blur, oninput,...
        options.rules.forEach(rule => {

            // Luu lai cac rule cho moi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            }else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(inputElement => {
                // Khi blur khoi input
                inputElement.onblur = () => {
                    validate(inputElement, rule)
                }

                // Xu li khi nguoi dung bat dau nhap vao input
                inputElement.oninput = () => {
                    var formGroupElement = inputElement.closest(options.formGroupSelector)
                    var errorElement = formGroupElement.querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    formGroupElement.classList.remove('invalid')
                }
            })
        })
    }
}


// Dinh nghia cac rule
// Nguyen tac cua rule:
// 1. Khi co loi => Tra ra message loi
// 2. Khi hop le => Khong tra ra cj ca(undefined)
Vadilator.isRequired = (selector, message) => {
    return {
        selector,
        // Kiem tra xem nguoi dung da nhap chua
        test: (value) => {
            return value ? undefined : message || 'Vui lòng nhập trường này!'
        }
    }
}

Vadilator.isEmail = (selector, message) => {
    return {
        selector,
        // Kiem tra xem day co phai la email hay khong
        test: (value) => {
            var regexEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/
            return regexEmail.test(value) ? undefined : message || 'Trường này phải là email!'
        }
    }
}

Vadilator.minLength = (selector, min, message) => {
    return {
        selector,
        test: (value) => {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}


Vadilator.isConfirmed = (selector, getConfirmValue, message) => {
    return {
        selector,
        test: (value) => {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác!' 
        }
    }
}