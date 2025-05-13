const JobPostHandler = require('../../src/Library/Handlers/JobPostHandler');

describe('JobPostHandler', () => {
    let mockConverter;
    let mockJobPostService;
    let jobPostHandler;

    beforeEach(() => {
        mockConverter = {
            convert: jest.fn(),
        };
        mockJobPostService = {
            create: jest.fn(),
        };
        jobPostHandler = new JobPostHandler(mockConverter, mockJobPostService);
    });

    describe('insertJob', () => {
        it('should convert the job and create a job post successfully', async () => {
            const job = {title: 'Test Job'};
            const jobType = 'full-time';
            const language = 'en';
            const convertedJob = {title: 'Converted Job'};
            const createdJob = {id: 1, title: 'Converted Job'};

            mockConverter.convert.mockReturnValue(convertedJob);
            mockJobPostService.create.mockResolvedValue(createdJob);

            const result = await jobPostHandler.insertJob(job, jobType, language);

            expect(mockConverter.convert).toHaveBeenCalledWith(job, jobType, language);
            expect(mockJobPostService.create).toHaveBeenCalledWith(convertedJob);
            expect(result).toEqual(createdJob);
        });

        it('should return null and log error in case of an exception', async () => {
            const job = {title: 'Test Job'};
            const jobType = 'full-time';
            const language = 'en';

            mockConverter.convert.mockImplementation(() => {
                throw new Error('Conversion error');
            });

            const result = await jobPostHandler.insertJob(job, jobType, language);

            expect(mockConverter.convert).toHaveBeenCalledWith(job, jobType, language);
            expect(result).toBeNull();
        });
    });

    describe('insertListOfJobs', () => {
        it('should handle multiple jobs insertion and return the count of successfully inserted jobs', async () => {
            const jobs = [{title: 'Job1'}, {title: 'Job2'}];
            const jobType = 'part-time';
            const language = 'fr';

            jest.spyOn(jobPostHandler, 'insertJob')
                .mockResolvedValueOnce({id: 1})
                .mockResolvedValueOnce(null);

            const result = await jobPostHandler.insertListOfJobs(jobs, jobType, language);

            expect(jobPostHandler.insertJob).toHaveBeenCalledTimes(2);
            expect(jobPostHandler.insertJob).toHaveBeenCalledWith(jobs[0], jobType, language);
            expect(jobPostHandler.insertJob).toHaveBeenCalledWith(jobs[1], jobType, language);
            expect(result).toBe(1);
        });
    });
});