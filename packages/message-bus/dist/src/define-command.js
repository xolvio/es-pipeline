export function defineCommandHandler(config) {
    // Cast the handle function to the base Command type for interface compatibility
    return {
        ...config,
        handle: config.handle,
    };
}
//# sourceMappingURL=define-command.js.map