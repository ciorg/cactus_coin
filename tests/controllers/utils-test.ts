import Utils from '../../src/controllers/lib/utils';

const utils = new Utils();


describe('controllers utils', () => {
    describe('formatMonth', () => {
        it('should return a 2 digit month', () => {
            const month1 = utils.formatMonth(4);
            const month2 = utils.formatMonth(12);

            expect(month1.length).toBe(2);
            expect(month2.length).toBe(2);
        });

        it('should return string and increment month number by 1', () => {
            const month1 = utils.formatMonth(4);
            const month2 = utils.formatMonth(10);

            expect(month1).toBe('05');
            expect(month2).toBe('11');
        });

        it('should update dec and jan correctly', () => {
            const month1 = utils.formatMonth(11);
            const month2 = utils.formatMonth(0);

            expect(month1).toBe('12');
            expect(month2).toBe('01');
        });
    });
});