document.getElementById("passwordCreateModal").addEventListener("input", (e) => {
    const weekSpan = document.querySelector("#passwordStrengthIndicator span.week");
    const mediumSpan = document.querySelector("#passwordStrengthIndicator span.medium");
    const strongSpan = document.querySelector("#passwordStrengthIndicator span.strong");
    const textSpan = document.querySelector("#passwordStrengthIndicator #textPasswordStrength");
    
    weekSpan.style.backgroundColor = "#bac2c2";
    mediumSpan.style.backgroundColor = "#bac2c2";
    strongSpan.style.backgroundColor = "#bac2c2";

    grandParentElement = e.target.parentElement.parentElement;
    let count = 0;
    const inputValue = e.target.value;
    if (inputValue.trim() === "") {
        if (grandParentElement.classList.contains("active")) {
            grandParentElement.classList.remove("active");
        }
        return;
    }
    grandParentElement.classList.add("active");

    if (inputValue.match(/\w+/g) != null){
        count += 1;
    }
    if (inputValue.length > 5) {
        if (inputValue.match(/\d+/g) != null) {
            count += 1;
        }
        if (inputValue.match(/[!,@,#,$,%,^,*,(,),&,_,-,~]/g) != null) {
            count += 1;
        }

    }

    if (count === 1) {
        weekSpan.style.backgroundColor = "#FF4858";
        
        textSpan.textContent = 'Mật khẩu quá yếu';
        textSpan.style.color = "#FF4858";

    } else if (count === 2) {
        weekSpan.style.backgroundColor = "#F29325";
        mediumSpan.style.backgroundColor = "#F29325";

        textSpan.textContent = 'Mật khẩu có độ bảo mật trung bình';
        textSpan.style.color = "#F29325";

    } else if (count === 3) {
        weekSpan.style.backgroundColor = "#03A64A";
        mediumSpan.style.backgroundColor = "#03A64A";
        strongSpan.style.backgroundColor = "#03A64A";

        textSpan.textContent = 'Mật khẩu có độ bảo mật mạnh';
        textSpan.style.color = "#03A64A";

    }
    
})