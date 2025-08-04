class InvoiceCapture {
    constructor() {
        this.video = document.getElementById('camera');
        this.canvas = document.getElementById('canvas');
        this.capturedImage = document.getElementById('captured-image');
        this.stream = null;
        this.currentImageData = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('start-camera').addEventListener('click', () => this.startCamera());
        document.getElementById('capture-photo').addEventListener('click', () => this.capturePhoto());
        document.getElementById('retake-photo').addEventListener('click', () => this.retakePhoto());
        document.getElementById('process-image').addEventListener('click', () => this.processImage());
        document.getElementById('save-to-sheets').addEventListener('click', () => this.saveToSheets());
        document.getElementById('cancel').addEventListener('click', () => this.cancel());
        document.getElementById('new-invoice').addEventListener('click', () => this.newInvoice());
    }

    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                } 
            });
            
            this.video.srcObject = this.stream;
            document.getElementById('start-camera').disabled = true;
            document.getElementById('capture-photo').disabled = false;
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Error al acceder a la cámara. Por favor, permite el acceso y recarga la página.');
        }
    }

    capturePhoto() {
        const context = this.canvas.getContext('2d');
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        context.drawImage(this.video, 0, 0);
        
        this.currentImageData = this.canvas.toDataURL('image/jpeg', 0.8);
        this.capturedImage.src = this.currentImageData;
        
        this.showSection('preview-section');
        this.hideSection('camera-section');
    }

    retakePhoto() {
        this.showSection('camera-section');
        this.hideSection('preview-section');
        this.currentImageData = null;
    }

    async processImage() {
        if (!this.currentImageData) return;
        
        this.showSection('processing-section');
        this.hideSection('preview-section');
        
        try {
            const result = await Tesseract.recognize(this.currentImageData, 'spa', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        document.querySelector('.loading').textContent = 
                            `Procesando... ${Math.round(m.progress * 100)}%`;
                    }
                }
            });
            
            const extractedText = result.data.text;
            const parsedData = this.parseInvoiceData(extractedText);
            this.populateForm(parsedData);
            
            this.showSection('form-section');
            this.hideSection('processing-section');
            
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Error al procesar la imagen. Por favor, intenta de nuevo.');
            this.showSection('preview-section');
            this.hideSection('processing-section');
        }
    }

    parseInvoiceData(text) {
        const data = {
            fecha: '',
            empresa: '',
            numeroFactura: '',
            total: '',
            concepto: text.substring(0, 200)
        };

        const lines = text.split('\n');
        
        for (let line of lines) {
            line = line.trim();
            
            const dateRegex = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;
            const dateMatch = line.match(dateRegex);
            if (dateMatch && !data.fecha) {
                const dateStr = dateMatch[1];
                const date = this.parseDate(dateStr);
                if (date) data.fecha = date;
            }
            
            const totalRegex = /(?:total|importe|precio)[\s:]*€?\s*(\d+[,\.]\d{2})/i;
            const totalMatch = line.match(totalRegex);
            if (totalMatch && !data.total) {
                data.total = totalMatch[1].replace(',', '.');
            }
            
            const invoiceRegex = /(?:factura|fact|nº|n°|numero)[\s:]*([A-Z0-9\-]+)/i;
            const invoiceMatch = line.match(invoiceRegex);
            if (invoiceMatch && !data.numeroFactura) {
                data.numeroFactura = invoiceMatch[1];
            }
            
            if (line.length > 5 && line.length < 50 && 
                !line.match(/\d{10,}/) && !data.empresa &&
                !line.match(/fecha|total|factura/i)) {
                data.empresa = line;
            }
        }
        
        return data;
    }

    parseDate(dateStr) {
        const formats = [
            /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
            /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})/
        ];
        
        for (let format of formats) {
            const match = dateStr.match(format);
            if (match) {
                let [, day, month, year] = match;
                if (year.length === 2) {
                    year = '20' + year;
                }
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }
        return '';
    }

    populateForm(data) {
        document.getElementById('fecha').value = data.fecha;
        document.getElementById('empresa').value = data.empresa;
        document.getElementById('numero-factura').value = data.numeroFactura;
        document.getElementById('total').value = data.total;
        document.getElementById('concepto').value = data.concepto;
    }

    async saveToSheets() {
        const formData = {
            fecha: document.getElementById('fecha').value,
            empresa: document.getElementById('empresa').value,
            numeroFactura: document.getElementById('numero-factura').value,
            total: document.getElementById('total').value,
            concepto: document.getElementById('concepto').value,
            timestamp: new Date().toISOString()
        };

        if (!formData.fecha || !formData.empresa || !formData.total) {
            alert('Por favor, completa al menos la fecha, empresa y total.');
            return;
        }

        try {
            await this.sendToGoogleSheets(formData);
            this.showSection('success-section');
            this.hideSection('form-section');
        } catch (error) {
            console.error('Error saving to sheets:', error);
            alert('Error al guardar en Google Sheets. Verifica tu configuración.');
        }
    }

    async sendToGoogleSheets(data) {
        const SHEET_ID = '18ZL4RWiljZs-TJJQasdoSaS_KXp0HMjAzvjJMMEQTu4';
        const API_KEY = 'AIzaSyBbNhSGpzyw00AZdck5PVTm0twhnCSLOeM';
        

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A1:append?valueInputOption=RAW&key=${API_KEY}`;
        
        const values = [[
            data.timestamp,
            data.fecha,
            data.empresa,
            data.numeroFactura,
            data.total,
            data.concepto
        ]];

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: values
            })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta de Google Sheets');
        }
    }

    cancel() {
        this.newInvoice();
    }

    newInvoice() {
        this.hideAllSections();
        this.showSection('camera-section');
        document.getElementById('start-camera').disabled = false;
        document.getElementById('capture-photo').disabled = true;
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.video.srcObject = null;
        }
        
        this.currentImageData = null;
        document.getElementById('invoice-form').reset();
    }

    showSection(sectionClass) {
        document.querySelector(`.${sectionClass}`).style.display = 'block';
    }

    hideSection(sectionClass) {
        document.querySelector(`.${sectionClass}`).style.display = 'none';
    }

    hideAllSections() {
        const sections = ['camera-section', 'preview-section', 'processing-section', 'form-section', 'success-section'];
        sections.forEach(section => this.hideSection(section));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InvoiceCapture();
});