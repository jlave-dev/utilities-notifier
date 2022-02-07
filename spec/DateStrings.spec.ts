import { getFirstOfMonth, getLastOfMonth, getFullMonth } from '../src/DateStrings';

describe('DateStrings is a module that', () => {
    describe('when the current Date is mocked to be 2022-01-15', () => {        
        beforeEach(() => {
            jasmine.clock().install();
            jasmine.clock().mockDate(new Date(2022, 0, 15));
        });
    
        afterEach(() => {
            jasmine.clock().uninstall();
        });
    
        describe('has a method getFirstOfMonth that', () => {
            it('should return "2022-01-01"', () => {
                const firstOfMonth = getFirstOfMonth();
                expect(firstOfMonth).toBe('2022-01-01');
            });
        });
        
        describe('has a method getLastOfMonth that', () => {
            it('should return "2022-01-31"', () => {
                const lastOfMonth = getLastOfMonth();
                expect(lastOfMonth).toBe('2022-01-31');
            });
        });

        describe('has a method getFullMonth that', () => {
            it('should return "January"', () => {
                const fullMonth = getFullMonth();
                expect(fullMonth).toBe('January');
            });
        });
    });
});