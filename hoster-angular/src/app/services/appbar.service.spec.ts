import {TestBed, inject} from '@angular/core/testing';

import {AppbarService} from './appbar.service';

describe('AppbarService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AppbarService]
        });
    });

    it('should be created', inject([AppbarService], (service: AppbarService) => {
        expect(service).toBeTruthy();
    }));
});
