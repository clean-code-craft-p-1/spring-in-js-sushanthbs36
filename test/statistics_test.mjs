import { computeStatistics } from '../statistics.mjs';
import { expect } from 'chai';

describe('Statistics (Human Temps Flexible Options using Range Bounds, Inline Inputs)', () => {
    const eps = 0.001;

    it('reports average, min, max, unit for Fahrenheit input (explicitly set F)', () => {
        const computedStats = computeStatistics([98.6, 98.2, 97.8, 102.2], { inputUnit: 'F' });
        expect(computedStats.average).to.be.closeTo(99.2, eps);
        expect(computedStats.min).to.be.closeTo(97.8, eps);
        expect(computedStats.max).to.be.closeTo(102.2, eps);
        expect(computedStats.unit).to.equal('F');
    });

    it('reports NaN for empty input array (unit F)', () => {
        const computedStats = computeStatistics([]);
        expect(Number.isNaN(computedStats.average)).to.be.true;
        expect(Number.isNaN(computedStats.min)).to.be.true;
        expect(Number.isNaN(computedStats.max)).to.be.true;
        expect(computedStats.unit).to.equal('F');
    });

    it('throws when a non-array input is provided', () => {
        expect(() => computeStatistics(undefined)).to.throw(TypeError);
        expect(() => computeStatistics(null)).to.throw(TypeError);
        expect(() => computeStatistics(42)).to.throw(TypeError);
        expect(() => computeStatistics('not-an-array')).to.throw(TypeError);
        expect(() => computeStatistics({ value: 37 })).to.throw(TypeError);
    });

    it('throws on invalid non-number inputs', () => {
        expect(() => computeStatistics(['not-number'])).to.throw(TypeError);
        expect(() => computeStatistics([98, '99'])).to.throw(TypeError);
    });

    it('converts explicit Celsius inputs to Fahrenheit (inputUnit=C)', () => {
        const stats = computeStatistics([37.0, 36.6, 39.0], { inputUnit: 'C' });
        expect(stats.average).to.be.closeTo(99.56, eps);
        expect(stats.min).to.be.closeTo(97.88, eps);
        expect(stats.max).to.be.closeTo(102.2, eps);
        expect(stats.unit).to.equal('F');
    });
    
    it('throws error when C value is outside human range', () => {
        expect(() => computeStatistics([37.0, 30.0], { inputUnit: 'C' })).to.throw(TypeError, /Input values must result in valid human temperatures/);
    });

    it('throws error when F value is outside human range', () => {
        expect(() => computeStatistics([98.6, 80.0], { inputUnit: 'F' })).to.throw(TypeError, /Input values must result in valid human temperatures/);
    });

    // Mismatch/Mixed Data Handling Tests
    it('throws error when inputUnit=F but values only fit the C range (no forceConvert)', () => {
        expect(() => computeStatistics([35.5, 36.0], { inputUnit: 'F' })).to.throw(TypeError, /inputUnit "F" mismatch/);
    });

    it('throws error when inputUnit=C but values only fit the F range (no forceConvert)', () => {
        expect(() => computeStatistics([104.0, 105.0], { inputUnit: 'C' })).to.throw(TypeError, /inputUnit "C" mismatch/);
    });

    it('converts correctly when inputUnit=F and forceConvertIfMismatch=true is used on C-range-only data', () => {
        const stats = computeStatistics([35.5, 36.0], { inputUnit: 'F', forceConvertIfMismatch: true });
        expect(stats.average).to.be.closeTo(96.35, eps); 
        expect(stats.min).to.be.closeTo(95.9, eps); 
        expect(stats.max).to.be.closeTo(96.8, eps); 
        expect(stats.unit).to.equal('F');
    });

    it('converts correctly when inputUnit=C and forceConvertIfMismatch=true is used on F-range-only data', () => {
        const stats = computeStatistics([104.0, 105.0], { inputUnit: 'C', forceConvertIfMismatch: true });
        expect(stats.average).to.be.closeTo(104.5, eps);
        expect(stats.min).to.be.closeTo(104.0, eps);
        expect(stats.max).to.be.closeTo(105.0, eps);
        expect(stats.unit).to.equal('F');
    });

    it('handles Mixed input correctly when convertMixedValues=true (converts only C-range values)', () => {
        const stats = computeStatistics([98.6, 37.0, 99.1], { inputUnit: 'F', convertMixedValues: true });
        expect(stats.average).to.be.closeTo(98.766, eps); 
        expect(stats.min).to.be.closeTo(98.6, eps);
        expect(stats.max).to.be.closeTo(99.1, eps);
        expect(stats.unit).to.equal('F');
    });

    it('throws error when inputUnit is omitted and other options are not mentioned', () => {
        expect(() => computeStatistics([35.5, 36.0], {})).to.throw(TypeError, /inputUnit must be specified when other options are omitted./);
    });

    it('converts correctly when inputUnit is omitted and forceConvertIfMismatch=true is used on C-range-only data', () => {
        const stats = computeStatistics([35.5, 36.0], { forceConvertIfMismatch: true });
        expect(stats.average).to.be.closeTo(96.35, eps); 
        expect(stats.min).to.be.closeTo(95.9, eps); 
        expect(stats.max).to.be.closeTo(96.8, eps); 
        expect(stats.unit).to.equal('F');
    });
    
    it('handles mixed input when inputUnit is omitted and convertMixedValues=true', () => {
        const stats = computeStatistics([98.6, 37.0, 99.1], { convertMixedValues: true });
        expect(stats.average).to.be.closeTo(98.766, eps); 
        expect(stats.min).to.be.closeTo(98.6, eps);
        expect(stats.max).to.be.closeTo(99.1, eps);
        expect(stats.unit).to.equal('F');
    });
});