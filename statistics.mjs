// @ts-check

// Constants for human temperature ranges
const MIN_HUMAN_TEMP_F = 93.0; // 34.0 C
const MAX_HUMAN_TEMP_F = 105.0; // 40.5 C
const MIN_HUMAN_TEMP_C = 34.0;
const MAX_HUMAN_TEMP_C = 40.5;

/**
 * @typedef {{ 
 *   inputUnit?: 'F'|'C', 
 *   forceConvertIfMismatch?: boolean,
 *   convertMixedValues?: boolean
 * }} ComputeOptions
 */

/**
 * Compute average, min, max for an array of temperature values.
 * Uses human temperature ranges to infer units when options allow ambiguity.
 *
 * @param {number[]} temperatures
 * @param {ComputeOptions} [options]
 * @returns {{ average:number, min:number, max:number, unit:'F' }}
 */
export function computeStatistics(
    /** @type {number[]} */ temperatures,
    /** @type {ComputeOptions} */ options = {}) {
    
    const {
        inputUnit,
        forceConvertIfMismatch = false,
        convertMixedValues = false
    } = options;

    
    /**
     * Convert a Celsius temperature to Fahrenheit.
     * @param {number} c
     * @returns {number}
     */
    const celsiusToFahrenheit = (c) => ((c * 9) / 5) + 32;


    /**
     * Checking if the Fahrenheit temperature is within the specified Range.
     * @param {number} val
     * @returns {boolean}
     */
    const isTempInFRange = (val) => val >= MIN_HUMAN_TEMP_F && val <= MAX_HUMAN_TEMP_F;

    /**
     * Checking if the Celsius temperature is within the specified Range.
     * @param {number} val
     * @returns {boolean}
     */
    const isTempInCRange = (val) => val >= MIN_HUMAN_TEMP_C && val <= MAX_HUMAN_TEMP_C;

    // Validating data Type of values in Array & checking if it is an Array
    if (!Array.isArray(temperatures) || !temperatures.every(n => typeof n === 'number' && Number.isFinite(n))) {
        throw new TypeError('Input must be an array of finite numbers.');
    }

    //Validating Empty Array
    if (temperatures.length === 0) {
        return { average: NaN, min: NaN, max: NaN, unit: 'F' };
    }
    
    /** @type {number[]} */
    let numbersInFahrenheit=[];

    if (inputUnit === 'C') {
        const anyF = temperatures.some(isTempInFRange);
        const anyC = temperatures.some(isTempInCRange);

        if (anyF && !anyC) { // All values only fit F range
            if (forceConvertIfMismatch) {
                numbersInFahrenheit = temperatures.slice(); // Treat as F, don't convert
            } else {
                throw new TypeError('inputUnit "C" mismatch; values fit in Fahrenheit range.');
            }
        } else if (anyC && anyF && convertMixedValues) { // Mixed values
             // Convert ONLY the values that fit the C range to F (leaving others as F)
            numbersInFahrenheit = temperatures.map(n => isTempInCRange(n) ? celsiusToFahrenheit(n) : n);
        } else { // All values fit C range
            numbersInFahrenheit = temperatures.map(celsiusToFahrenheit);
        }

    } else if (inputUnit === 'F') {
        const anyF = temperatures.some(isTempInFRange);
        const anyC = temperatures.some(isTempInCRange);

        if (anyC && !anyF) { // All values only fit C range
            if (forceConvertIfMismatch) {
                numbersInFahrenheit = temperatures.map(celsiusToFahrenheit); // Treat as C, convert to F
            } else {
                throw new TypeError('inputUnit "F" mismatch; values only fit Celsius range.');
            }
        } else if (anyF && anyC && convertMixedValues) { // Mixed values
            // Convert ONLY the values that fit the C range to F (leaving others as F)
            numbersInFahrenheit = temperatures.map(n => isTempInCRange(n) ? celsiusToFahrenheit(n) : n);
        } else { // All values fit F range
            numbersInFahrenheit = temperatures.slice();
        }
    }else {
        // If inputUnit is omitted
        const anyF = temperatures.some(isTempInFRange);
        const anyC = temperatures.some(isTempInCRange);
        
        if (anyC && anyF && convertMixedValues) {
            // Convert Only the values that fit the C range to F (leaving others as F)
            numbersInFahrenheit = temperatures.map(n => isTempInCRange(n) ? celsiusToFahrenheit(n) : n);
        } else if (forceConvertIfMismatch) {
            if (anyC && !anyF) { // Only C range fits -> treat as C, convert to F
                numbersInFahrenheit = temperatures.map(celsiusToFahrenheit);
            } else if(anyF && !anyC){ // Only F range fits treat as F, no conversion
                numbersInFahrenheit = temperatures.slice(); 
            }
        } else {
             throw new TypeError('inputUnit must be specified when other options are omitted.');
        }
    }

    // If any final value is completely outside the valid human range, it's an error.
    if (!numbersInFahrenheit.every(isTempInFRange)) {
        throw new TypeError('Input values must result in valid human temperatures (93F-105F).');
    }

    const values=numbersInFahrenheit.reduce((acc,val) => {
        acc.sum+=val;
        acc.min=Math.min(acc.min,val);
        acc.max=Math.max(acc.max,val);
        return acc;
    },{sum:0,min:Infinity,max:-Infinity});

    return {
        average: values.sum / numbersInFahrenheit.length,
        min: values.min,
        max: values.max,
        unit: 'F'
    };
}