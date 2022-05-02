const app = Vue.createApp({
    data(){
        return{
            choseP_L: false,
            choseP_M: false,
            choseS_A: false,
            choseS_I: false,
            choseS_R:false,
            ChoseS_M1:false,ChoseS_M2:false,ChoseS_M3:false,ChoseS_M4:false,ChoseS_M5:false,ChoseS_M6:false,ChoseS_M7:false
        };
    },
    methods:{
        showpalierL(){
            if(this.choseP_L === false){
                this.choseP_L = true;
            }
            else{
                this.choseP_L = false;
            }
        },
        showpalierM(){
            if(this.choseP_M === false){
                this.choseP_M = true;
            }
            else{
                this.choseP_M = false;
            }
        },
        showspecialiteA(){
            if(this.choseS_A === false){
                this.choseS_A = true;
            }
            else{
                this.choseS_A = false;
            }
        },
        showspecialiteI(){
            if(this.choseS_I === false){
                this.choseS_I = true;
            }
            else{
                this.choseS_I = false;
            }
        },
        showspecialiteR(){
            if(this.choseS_R === false){
                this.choseS_R = true;
            }
            else{
                this.choseS_R = false;
            }
        },
        showspecialiteM0(){
            if(this.ChoseS_M1 === false){
                this.ChoseS_M1 = true;
            }
            else{
                this.ChoseS_M1 = false;
            }
        },
        showspecialiteM1(){
            if(this.ChoseS_M2 === false){
                this.ChoseS_M2 = true;
            }
            else{
                this.ChoseS_M2 = false;
            }
        },
        showspecialiteM2(){
            if(this.ChoseS_M3 === false){
                this.ChoseS_M3 = true;
            }
            else{
                this.ChoseS_M3 = false;
            }
        },
        showspecialiteM3(){
            if(this.ChoseS_M4 === false){
                this.ChoseS_M4 = true;
            }
            else{
                this.ChoseS_M4 = false;
            }
        },
        showspecialiteM4(){
            if(this.ChoseS_M5 === false){
                this.ChoseS_M5 = true;
            }
            else{
                this.ChoseS_M5 = false;
            }
        },
        showspecialiteM5(){
            if(this.ChoseS_M6 === false){
                this.ChoseS_M6 = true;
            }
            else{
                this.ChoseS_M6 = false;
            }
        },
        showspecialiteM6(){
            if(this.ChoseS_M7 === false){
                this.ChoseS_M7 = true;
            }
            else{
                this.ChoseS_M7 = false;
            }
        },
    },
    computed:{
        showP_L(){
            return{show: this.choseP_L};
        },
        showP_M(){
            return{show: this.choseP_M};
        },
        showS_A(){
            return{show: this.choseS_A};
        },
        showS_I(){
            return{show: this.choseS_I};
        },
        showS_R(){
            return{show: this.choseS_R};
        },
        showS_M1(){
            return{show: this.ChoseS_M1};
        },
        showS_M2(){
            return{show: this.ChoseS_M2};
        },
        showS_M3(){
            return{show: this.ChoseS_M3};
        },
        showS_M4(){
            return{show: this.ChoseS_M4};
        },
        showS_M5(){
            return{show: this.ChoseS_M5};
        },
        showS_M6(){
            return{show: this.ChoseS_M6};
        },
        showS_M7(){
            return{show: this.ChoseS_M7};
        },
    }
});
app.mount("#navbare");